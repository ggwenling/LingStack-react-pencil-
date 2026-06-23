# LingStack 学习进度与任务完成机制 — 方案书

**版本**：v1.1  
**日期**：2026-06-21  
**适用产品**：LingStack Desktop（React / Next.js AI 学习平台）  
**文档目的**：供产品、技术、业务负责人及 Cursor 落地「任务何时算完成、何时解锁下一关」的改造方案  

---

## 目录

1. [背景与问题](#一背景与问题)
2. [方案目标](#二方案目标)
3. [方案概述](#三方案概述)
4. [用户旅程](#四用户旅程)
5. [课程体系设计](#五课程体系设计)
6. [判题机制](#六判题机制)
7. [进度状态机](#七进度状态机)
8. [数据模型设计](#八数据模型设计)
9. [API 与服务改造](#九api-与服务改造)
10. [AI 成本与风控](#十ai-成本与风控)
11. [实施计划](#十一实施计划)
12. [风险与对策](#十二风险与对策)
13. [关键指标](#十三关键指标)
14. [资源需求](#十四资源需求)
15. [决策建议](#十五决策建议)
16. [与现状代码对照](#十六与现状代码对照)
17. [待 Codex 评审 / 开放问题](#十七待-codex-评审--开放问题)
18. [Codex 补充评审与 Cursor 落地约束](#十八codex-补充评审与-cursor-落地约束)

---

## 一、背景与问题

### 1.1 产品现状

LingStack 目前已具备：

| 能力 | 现状 | 相关代码/路径 |
|------|------|---------------|
| 用户鉴权 | `/home` 路由 cookie 校验；聊天 API 401 | `proxy.ts`、`lib/auth/session.ts` |
| AI 学习对话 | 流式聊天 + 学习记忆 | `app/api/chat/api/handler.ts` |
| 学习路线图 | 5 阶段固定目录 | `lib/learning/roadmap-catalog.ts` |
| 进度存储 | JSON 字段存 roadmap / dailyTasks | `prisma/schema.prisma` → `LearningProgress` |
| 进度更新 | 每次聊天结束 AI 提取并 upsert | `updateLearningProgress()` in chat handler |
| 路线图展示 | 关键词推断 + AI 状态混合 | `lib/learning/roadmap-view.ts`、`curriculum.ts` |

### 1.2 核心问题

当前进度机制存在明显缺陷：

| 问题 | 表现 | 业务影响 |
|------|------|----------|
| **完成标准模糊** | 用户聊几句，AI 就可能更新「已完成」 | 学习成就感失真，用户不信任进度 |
| **对话触发进度** | 首轮对话 `onFinish` 即调用 `updateLearningProgress` | 刷进度成本低，数据不可用于运营 |
| **AI 是唯一裁判** | `roadmapSteps.status` 由模型直接写入，无服务端校验 | 进度跳跃、前后不一致、无法审计 |
| **练习与进度脱节** | 文案强调「实战练习」，但代码提交不是必选项 | 产品承诺与系统行为不一致 |

**结论**：不是缺鉴权，而是缺「完成的定义」和「服务端裁决机制」。

### 1.4 Codex 评审结论（v1.1 补充）

本方案方向可行，能解决当前「聊过就可能被标为学过」的核心痛点，但 MVP 必须收窄：

- `LearningProgress` 不再是真相源，只能作为展示缓存和聊天摘要容器。
- 真正的学习完成状态只能来自 `LessonProgress + LearningExercise + ExerciseSubmission`。
- MVP 不做 AI 生成题目，只做固定模板题，先验证「提交 → 判题 → 解锁」闭环。
- 聊天 API 不允许写入 roadmap / dailyTasks 的完成状态，也不允许写入 `masteredTopics`。
- 所有状态推进必须由服务端状态机在事务内完成，不能相信客户端响应或 AI 返回的 `passed`。

### 1.3 当前进度更新链路（需改造）

```
用户发送聊天消息
  → POST /api/chat
  → streamText 流式回复
  → onFinish:
      saveAssistantMessage
      updateLearningProgress()        ← 取最近 10 条消息
        → generateObject(progressSchema)
        → 直接 upsert LearningProgress（含 roadmapSteps、dailyTasks）
      revalidateLearningSurfaces
```

Prompt 虽要求「阶段推进要保守」，但仅为软约束，代码无硬性校验：

- `app/api/chat/prompts/learning-prompts.ts` → `buildProgressExtractionPrompt`
- `lib/validation/chat.ts` → `progressSchema`

---

## 二、方案目标

### 2.1 总目标

建立 **「学 → 练 → 交 → 判 → 解锁」** 闭环，使学习进度具备：

1. **可验证**：完成必须有代码提交记录
2. **可审计**：每次通过/不通过有评分与反馈
3. **可复现**：同一题目、同一 Rubric，结果可追溯
4. **可运营**：进度数据可用于留存、转化、完课率分析

### 2.2 非目标（本期不做）

- 不做完整 OJ（Online Judge）平台
- 不做复杂防作弊（摄像头、代码查重库）
- 不要求所有知识点都自动化判题（人工复核作为后续能力）
- 不在 MVP 阶段投入 React 组件沙箱渲染测试

### 2.3 验收标准

| # | 验收项 | 通过条件 |
|---|--------|----------|
| 1 | 空聊不推进 | 新建会话、只寒暄、不提交代码 → 路线图状态不变 |
| 2 | 提交是硬门槛 | 未点击「提交代码」→ 任何 lesson 不能变为 done |
| 3 | 判题可追溯 | 每次提交有 score、feedback、criteria 明细 |
| 4 | 顺序解锁 | 前一课未通过 → 后一课保持 locked |
| 5 | 防 AI 乱跳 | 服务端拒绝非法状态跃迁（跳阶段、多 active） |
| 6 | 聊天角色清晰 | AI 聊天用于讲解；进度只由判题 API 推进 |

---

## 三、方案概述

### 3.1 一句话方案

> **AI 负责出题与评分建议；用户必须提交代码；服务端依据题目 Rubric + 规则做最终判定；判定通过后才标记目标完成并解锁下一关。**

### 3.2 角色分工

```
课程目录 Catalog ──定义目标──▶ 练习关卡 Exercise
                              │
                    AI 生成变体 ▼
                         题目实例
                              │
用户 ──学习/提问──▶ AI 聊天（不推进进度）
  │
  └──硬性提交代码──▶ 代码提交 API
                        │
                        ▼
                   AI 判题 + 静态规则
                        │
                        ▼
                   服务端裁决引擎
                        │
                        ▼
                   进度状态机 ──▶ 路线图 UI
```

| 模块 | 职责 | 是否可推进进度 |
|------|------|----------------|
| AI 聊天 | 讲解、提示、答疑 | ❌ 否 |
| AI 出题 | 基于 lesson 生成练习与 Rubric | ❌ 否（只创建题目） |
| 代码提交 | 用户主动提交 | ✅ 触发判题 |
| AI 判题 | 按 Rubric 打分、给反馈 | ❌ 仅建议 |
| 服务端裁决 | 综合判定 passed / failed | ✅ 唯一写入进度 |
| 状态机 | 控制 active / done / locked | ✅ 决定解锁 |

---

## 四、用户旅程

### 4.1 标准学习路径

```
进入路线图
  → 看到当前「进行中」课节（如：Hooks 进阶）
  → 系统展示本课练习要求（模板题或 AI 变体）
  → 用户可进入 AI 聊天问问题（不影响进度）
  → 用户在练习区编写代码并点击「提交」
  → 系统判题：通过 / 未通过 + 分项反馈
  → 通过：本课标记完成，自动解锁下一课
  → 未通过：保持本课 active，用户修改后再次提交
```

### 4.2 用户体验原则

- **聊天自由，进度严格**：问再多问题也不会「误完成」
- **失败可理解**：按评分项说明差在哪，而非简单说「错了」
- **进步可见**：每课 1~3 道题，做完一题有一题的成就感
- **不打击积极度**：允许有限次数重试；通过后不惩罚性追问

### 4.3 界面改造点

| 页面 | 改造 |
|------|------|
| `/home/roadmap` | active lesson 显示「去完成练习」入口 |
| `/home/[id]/ai` | 增加练习面板（题目 + 代码编辑器 + 提交） |
| 提交结果页/弹层 | 通过/未通过、分项评分、改进建议 |
| `/home` 今日任务 | 与当前 active exercise 对齐，不由 AI 自由生成 |

---

## 五、课程体系设计

### 5.1 三级结构

沿用 `ROADMAP_CATALOG`，扩展为：

```
Stage（阶段，5 个）
  └── Lesson（课节）
        └── Exercise（练习，建议 1~3 道/课）
              └── Rubric Item（评分项）
```

### 5.1.1 稳定 ID 要求（阻塞 MVP）

落地前必须为 catalog 增加稳定 ID，不允许继续只依赖数组下标或中文标题做数据库关联。原因：

- 中文标题会改，数组顺序会调，旧进度不能因此失效。
- `LessonProgress.lessonKey`、`LearningExercise.templateId`、提交记录都需要稳定外键语义。
- 聚合 `LearningProgress.roadmapSteps` 时要能从数据库状态稳定映射回 UI。

建议 ID 规则：

| 层级 | 字段 | 示例 |
|------|------|------|
| Stage | `stageKey` | `js-basics`、`react-components-state` |
| Lesson | `lessonKey` | `jsx-rendering`、`hooks-effect-context`、`perf-memo-callback` |
| Exercise Template | `templateId` | `jsx-basics-render`、`hooks-effect-cleanup`、`perf-memo-callback` |
| Rubric Item | `criteriaId` | `renders-list`、`uses-effect`、`has-cleanup` |

`ROADMAP_CATALOG` 建议从：

```ts
type RoadmapCatalogStage = {
  curriculumTitle: string;
  lessons?: Array<{ title: string; hours: number; keywords: string[] }>;
};
```

扩展为：

```ts
type RoadmapCatalogStage = {
  stageKey: string;
  curriculumTitle: string;
  displayTitle: string;
  estimatedTotalHours: number;
  lessons?: Array<{
    lessonKey: string;
    title: string;
    hours: number;
    keywords: string[];
    exerciseTemplateIds: string[];
  }>;
};
```

现有 catalog 示例（`lib/learning/roadmap-catalog.ts`）：

| 阶段 | curriculumTitle | 子结构 |
|------|-----------------|--------|
| 1 | 基础语法 | modules |
| 2 | 组件与状态管理 | lessons（含 keywords） |
| 3 | 路由与数据获取 | unlockHint |
| 4 | 进阶与优化 | unlockHint |
| 5 | 实战项目 | unlockHint |

### 5.2 题目来源策略

| 类型 | 说明 | 占比建议 |
|------|------|----------|
| **模板题（Catalog 内置）** | 题目、要求、Rubric 预先写好 | 70% |
| **AI 变体题** | 基于模板换场景、改变量名 | 30% |

**原则**：无论 AI 如何变体，入库后必须固化为结构化题目；判题只认库中 Rubric。

**MVP 强约束**：Phase 1 不做 AI 变体题，也不做 `/generate` 出题 API。只使用内置模板题，先把「固定模板题 → 提交 → 判题 → 解锁」跑通。AI 变体题放到 Phase 2 之后，否则会把题目质量、缓存、复现和成本问题提前引入 MVP。

### 5.3 示例：课节「Hooks 进阶」

**题目**：实现一个带清理函数的 `useEffect`，在组件卸载时清除定时器。

**硬性要求**：

1. 必须使用 `useEffect`
2. 必须 `return` 清理函数
3. 依赖数组合理

**Rubric（100 分）**：

| 评分项 ID | 名称 | 权重 | 判定方式 |
|-----------|------|------|----------|
| `uses-effect` | 使用 useEffect | 30 | 静态 + AI |
| `has-cleanup` | 清理函数 | 40 | 静态 + AI |
| `correct-deps` | 依赖数组 | 30 | AI |

**通过线**：总分 ≥ 70，且 `uses-effect`、`has-cleanup` 必须满足。

### 5.4 Catalog 扩展示例（TypeScript）

```ts
// 建议扩展 lib/learning/roadmap-catalog.ts 或新建 exercise-catalog.ts
type ExerciseTemplate = {
  id: string;
  title: string;
  description: string;
  starterCode?: string;
  requirements: string[];
  rubric: Array<{
    id: string;
    label: string;
    weight: number;
    staticCheck?: "contains-use-effect" | "has-return-cleanup";
  }>;
  passScore: number;
  requiredCriteriaIds: string[];
};

type LessonWithExercises = {
  title: string;
  hours: number;
  keywords: string[];
  exerciseTemplates: ExerciseTemplate[];
};
```

---

## 六、判题机制

### 6.1 判题流程

```
用户提交 code
  → 服务端校验（登录、题目归属、代码非空、长度限制）
  → 静态规则检查（关键词、结构）
  → AI 结构化判题（generateObject）
  → 服务端最终裁决
  → 写入 ExerciseSubmission + 更新 LessonProgress
  → 若课节全部练习通过 → 解锁下一课/阶段
  → 聚合更新 LearningProgress.roadmapSteps（只读缓存）
```

### 6.2 双层判定

| 层级 | 作用 | 示例 |
|------|------|------|
| 静态规则 | 挡明显不合格 | 没有 `useEffect` 直接 fail 对应项 |
| AI 判题 | 理解语义与质量 | 依赖数组是否合理 |
| 服务端裁决 | 防 AI 误判/篡改 | `passed` 需同时满足分数 + 必选项 |

### 6.3 判题输出 Schema（建议）

```ts
const gradingResultSchema = z.object({
  passed: z.boolean(),
  score: z.number().min(0).max(100),
  feedback: z.string(),
  criteriaResults: z.array(
    z.object({
      id: z.string(),
      met: z.boolean(),
      reason: z.string(),
    }),
  ),
  nextHint: z.string().optional(),
});
```

### 6.4 服务端最终裁决逻辑（伪代码）

```ts
function finalizePassed(
  ai: GradingResult,
  exercise: ExerciseTemplate,
  staticResults: Record<string, boolean>,
): boolean {
  const scoreOk = ai.score >= exercise.passScore;
  const requiredOk = exercise.requiredCriteriaIds.every((id) => {
    const staticMet = staticResults[id];
    const aiMet = ai.criteriaResults.find((c) => c.id === id)?.met;
    return staticMet ?? aiMet ?? false;
  });
  return ai.passed && scoreOk && requiredOk;
}
```

### 6.5 判题能力演进

| 阶段 | 能力 | 准确率预期 |
|------|------|------------|
| MVP | AI + 静态规则 | 中等，可上线验证 |
| V2 | hidden test cases（可执行 JS） | 较高 |
| V3 | React 组件渲染测试（沙箱） | 高（成本高） |

---

## 七、进度状态机

### 7.1 状态定义

| 状态 | 含义 |
|------|------|
| `locked` | 前置未完成，不可开始 |
| `active` | 当前应学习/练习 |
| `passed` | 本练习/课节已通过 |

> 注：UI 层 `roadmap-view.ts` 另有 `done` 展示态，服务端建议统一用 `passed`，展示层映射为 `done`。

### 7.2 解锁规则（写死，不由 AI 决定）

1. 每个 stage 内，lesson 按 catalog 顺序解锁
2. 同一时刻仅允许：
   - 1 个 active stage
   - 1 个 active lesson
   - 1 个 active exercise（建议）
3. lesson 内所有 exercise `passed` → lesson `passed`
4. stage 内所有 lesson `passed` → stage `passed`，下一阶段首个 lesson → `active`
5. 禁止跳关（除非未来加「前置测评跳过」）

### 7.3 与现有 UI 状态映射

现有 `roadmap-view.ts` → `mapStageStatus`：

| 服务端 | UI 展示 |
|--------|---------|
| stage passed | `done` |
| stage active | `active` |
| stage locked | `locked` |
| lesson passed | lesson `done` |
| lesson active | lesson `active` |

### 7.4 状态机伪代码

```ts
function onExercisePassed(userId: string, lessonKey: string) {
  const lesson = getLessonProgress(userId, lessonKey);
  const allExercisesPassed = lesson.exercises.every((e) => e.status === "passed");

  if (!allExercisesPassed) return;

  markLessonPassed(userId, lessonKey);

  const nextLesson = getNextLessonInStage(lessonKey);
  if (nextLesson) {
    activateLesson(userId, nextLesson);
    return;
  }

  markStagePassed(userId, lesson.stageKey);
  const nextStageFirstLesson = getFirstLessonOfNextStage(lesson.stageKey);
  if (nextStageFirstLesson) {
    activateLesson(userId, nextStageFirstLesson);
  }
}
```

---

## 八、数据模型设计

### 8.1 新增 Prisma 模型（建议）

```prisma
enum ExerciseStatus {
  PENDING
  ACTIVE
  PASSED
}

enum LessonStatus {
  LOCKED
  ACTIVE
  PASSED
}

model LessonProgress {
  id         String       @id @default(cuid())
  userId     String
  stageKey   String
  stageIndex Int
  lessonKey  String
  status     LessonStatus @default(LOCKED)
  activeExerciseId String?
  startedAt  DateTime?
  passedAt   DateTime?
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt
  user       User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  exercises  LearningExercise[]

  @@unique([userId, lessonKey])
  @@index([userId, status])
  @@index([userId, stageIndex])
}

model LearningExercise {
  id             String         @id @default(cuid())
  userId         String
  lessonProgressId String
  stageKey       String
  lessonKey      String
  templateId     String
  templateVersion Int           @default(1)
  title          String
  requirements   Json
  rubric         Json
  starterCode    String?
  passScore      Int            @default(70)
  requiredCriteriaIds Json      @default("[]")
  status         ExerciseStatus @default(PENDING)
  passedAt       DateTime?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  lessonProgress LessonProgress @relation(fields: [lessonProgressId], references: [id], onDelete: Cascade)
  submissions    ExerciseSubmission[]

  @@index([userId, status])
}

model ExerciseSubmission {
  id          String   @id @default(cuid())
  exerciseId  String
  userId      String
  attemptNumber Int
  code        String
  staticResult Json
  aiResult    Json
  criteriaResults Json
  finalPassed Boolean
  score       Int
  feedback    String
  model       String?
  promptVersion String?
  createdAt   DateTime @default(now())
  exercise    LearningExercise @relation(fields: [exerciseId], references: [id], onDelete: Cascade)

  @@index([userId, exerciseId, createdAt])
}
```

### 8.2 现有 `LearningProgress` 调整

| 字段 | 改造后职责 |
|------|------------|
| `summary` | 继续由聊天 AI 更新（辅助） |
| `weakTopics` / `nextPlan` | 继续由聊天 AI 更新（辅助） |
| `masteredTopics` | **仅**在 exercise passed 时由服务端写入 |
| `roadmapSteps` | 由 `LessonProgress` 聚合生成，AI 不可直接写 status |
| `dailyTasks` | 由 active exercise 生成，AI 不可直接写 status |

### 8.3 Source of Truth

```
LessonProgress + LearningExercise + ExerciseSubmission  → 真相源
LearningProgress.roadmapSteps / dailyTasks            → 展示缓存（聚合）
```

### 8.4 建模落地约束（Cursor 必须遵守）

- `LessonProgress.status`、`LearningExercise.status`、`ExerciseSubmission.finalPassed` 是服务端状态机结果，客户端不能直接传入。
- `ExerciseSubmission.aiResult` 保存 AI 原始结构化输出，`staticResult` 保存静态检查结果，`criteriaResults` 保存服务端最终合并后的分项结果。
- `attemptNumber` 由服务端根据同一 `exerciseId` 历史提交数计算，不能相信客户端。
- `templateVersion` 和 `promptVersion` 必须记录，后续模板或判题 prompt 变更后，旧提交仍可解释。
- `LearningProgress.masteredTopics` 只能由 exercise passed 后的聚合器写入，聊天总结不得写入。
- 旧的 `LearningProgress.roadmapSteps` / `dailyTasks` 可以继续存在，但只能由聚合器覆盖，不能再由 `progress_extract` 直接写状态。

---

## 九、API 与服务改造

### 9.1 新增 API

| 端点 | 方法 | 鉴权 | 作用 |
|------|------|------|------|
| `/api/learning/exercises/current` | GET | ✅ | 获取当前 active 练习 |
| `/api/learning/exercises/submit` | POST | ✅ | 提交代码并判题 |
| `/api/learning/progress` | GET | ✅ | 获取聚合路线图状态 |

> MVP 不实现 `/api/learning/exercises/generate`。题目从 `exercise-catalog.ts` 内置模板加载。后续 Phase 2 若要加入 AI 变体题，再新增 generate API，并把生成后的题目固化入库。

### 9.2 `POST /api/learning/exercises/submit` 请求/响应

**请求**：

```json
{
  "exerciseId": "cuid...",
  "code": "import { useEffect } from 'react';\n..."
}
```

**响应**：

```json
{
  "passed": false,
  "score": 55,
  "feedback": "你已正确使用 useEffect，但缺少 cleanup 函数。",
  "criteria": [
    { "id": "uses-effect", "name": "使用 useEffect", "met": true },
    { "id": "has-cleanup", "name": "清理函数", "met": false }
  ],
  "nextHint": "在 useEffect 内 return 一个函数，用于 clearInterval。",
  "lessonCompleted": false,
  "unlockedLessonKey": null
}
```

### 9.3 建议新增服务模块

```
lib/learning/
  exercise-catalog.ts      # 模板题定义
  exercise-service.ts      # 出题、获取当前练习
  grading-service.ts       # 静态检查 + AI 判题 + 最终裁决
  progress-state-machine.ts # 解锁逻辑
  progress-aggregator.ts   # 聚合写入 LearningProgress
```

### 9.3.1 服务层事务边界（阻塞 MVP）

`POST /api/learning/exercises/submit` 不能把写入拆散到多个互不关联的 await。一次提交的最终落库必须遵守：

1. 校验登录用户。
2. 读取 exercise，并校验 `exercise.userId === currentUser.id`。
3. 校验 exercise 属于当前 active lesson / active exercise。
4. 校验提交频率、每日次数、代码长度。
5. 运行静态检查和 AI 判题。
6. 服务端合并 `staticResult + aiResult` 得出 `finalPassed`。
7. 在一个 DB transaction 中完成：
   - 创建 `ExerciseSubmission`
   - 必要时更新 `LearningExercise.status/passedAt`
   - 必要时更新 `LessonProgress.status/passedAt`
   - 必要时解锁下一 lesson / exercise
   - 聚合覆盖 `LearningProgress.roadmapSteps/dailyTasks/masteredTopics`
8. transaction 成功后再 `revalidatePath`。

如果 transaction 失败，客户端只能看到失败响应，不能出现「提交记录已写入但路线图没解锁」或「路线图解锁但 submission 丢失」的半成功状态。

### 9.3.2 并发提交规则（阻塞 MVP）

同一用户、同一 exercise 快速连续提交时，必须保证状态一致：

- MVP 建议用 Redis lock：`learning:exercise-submit:{userId}:{exerciseId}`，TTL 30 秒。
- 拿不到锁时返回「正在判题，请稍后」。
- 仍需 DB 层按 `exerciseId` 计算 `attemptNumber`，不能由客户端传。
- 如果 exercise 已经 `PASSED`，后续提交只记录为复练 submission，不得回退 lesson 状态。

### 9.4 现有聊天 API 改造

`app/api/chat/api/handler.ts` → `updateLearningProgress`：

| 行为 | 改造 |
|------|------|
| 更新 summary / weakTopics / nextPlan | 保留 |
| 更新 roadmapSteps.status | **移除** |
| 更新 dailyTasks.status | **移除** |
| 更新 masteredTopics | **改为**仅读取，不在聊天流程写入 |

### 9.4.1 聊天进度解耦验收规则

Cursor 落地时必须保证：

- `app/api/chat/api/handler.ts` 的 `updateLearningProgress()` 不再写 `roadmapSteps.status`。
- `app/api/chat/api/handler.ts` 的 `updateLearningProgress()` 不再写 `dailyTasks.status`。
- `app/api/chat/api/handler.ts` 的 `updateLearningProgress()` 不再写 `masteredTopics`。
- `app/api/chat/prompts/learning-prompts.ts` 中删除或改写「输出 roadmapSteps status / dailyTasks status」的 prompt 要求。
- 聊天仍可更新 `summary`、`weakTopics`、`nextPlan`，但这些字段只用于辅助推荐，不参与解锁裁决。

---

## 十、AI 成本与风控

### 10.1 Token 消耗变化

| 场景 | 现在 | 改造后 |
|------|------|--------|
| 每次聊天结束 | 1 次 progress_extract | 0 次（或仅轻量摘要） |
| 进入课节 / 生成题 | 无 | 1 次出题 |
| 每次代码提交 | 无 | 1 次判题 |

总体：从「高频低价值」转为「低频高价值」，可接受。

### 10.2 风控

- 单题每日最大提交次数（建议 20）
- 提交间隔（建议 ≥ 10 秒）
- 代码长度上限（建议 8KB）
- 判题 temperature 调低（如 0~0.2）
- 记录 `aiResult` 原始 JSON 便于复盘

### 10.3 AI 调用 source 标记

沿用现有 `recordAiTokenUsage`，新增 source：

- `exercise_generate`
- `exercise_grade`

---

## 十一、实施计划

### Phase 1 — MVP（2~3 周）

**范围**：「组件与状态管理」阶段，2~3 个 lesson，每课 1 道模板题

- [ ] Prisma 模型 + migration
- [ ] 给 `ROADMAP_CATALOG` 增加 `stageKey` / `lessonKey` / `exerciseTemplateIds`
- [ ] 模板题 catalog（至少 3 道），不做 AI 生成题
- [ ] 当前练习 / 提交 / 判题 API
- [ ] 状态机 + 聚合写 LearningProgress
- [ ] 聊天进度解耦
- [ ] 路线图页 + AI 页练习 UI（最小可用）
- [ ] 单元测试覆盖 `finalizePassed`、状态机、聚合器
- [ ] E2E 覆盖「登录 → 做题 → 提交 → 解锁」

**里程碑**：内部可走完「学一课 → 提交 → 解锁下一课」

### Phase 1 推荐任务顺序（给 Cursor）

1. 先改 catalog 类型与数据，补稳定 ID，不引入数据库。
2. 新建 `exercise-catalog.ts`，只写 3 道模板题。
3. 新增 Prisma 模型和 migration。
4. 写 repository/service：当前练习初始化、提交记录、状态机、聚合器。
5. 写 `grading-service.ts`：先静态检查，再接 AI 判题。
6. 改聊天 API：移除对路线图/任务完成状态的写入。
7. 改 UI：路线图入口、AI 页练习面板、提交结果。
8. 补测试和构建验证。

### Phase 2 — 扩面（3~4 周）

- [ ] 5 阶段主流 lesson 模板题
- [ ] 首页今日任务联动
- [ ] 提交历史与重试体验
- [ ] 运营看板（提交数、通过率、完课率）

### Phase 3 — 质量（4~6 周）

- [ ] JS 题 hidden test cases
- [ ] 阶段结业测验
- [ ] 申诉/复核入口（可选）
- [ ] 判题质量监控

---

## 十二、风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| AI 判题不准 | 用户挫败 | 双层判定 + 分项反馈 + 允许重试 |
| 题目质量不稳 | 体验差 | 70% 模板题 + AI 只做变体 |
| 开发量超预期 | 延期 | 分期；MVP 只做 1 个阶段 |
| 用户让 AI 写答案 | 学习效果差 | 产品接受；后续加变形题 |
| React 题难自动执行 | 判题局限 | MVP 语义判题，V2 沙箱 |
| 旧用户进度迁移 | 数据不一致 | 见 [开放问题](#十七待-codex-评审--开放问题) |
| 并发提交导致状态错乱 | 通过/未通过互相覆盖 | Redis lock + DB transaction |
| 客户端伪造 passed | 非法解锁 | 服务端只接受 code，不接受 finalPassed |
| 代码回显 XSS | 安全问题 | 代码只按文本/代码块渲染，不使用 `dangerouslySetInnerHTML` |

---

## 十三、关键指标

上线后 30 天观察：

| 指标 | 说明 | 目标方向 |
|------|------|----------|
| 练习提交率 | 进入 active lesson 的用户中提交比例 | ↑ |
| 一次通过率 | 首次提交即通过占比 | 40%~60% |
| 课节完课率 | 进入课节 → 最终通过 | ↑ |
| 阶段完课率 | 阶段内全部 lesson 通过 | ↑ |
| 误完成率 | 无提交却显示 done | = 0 |
| 判题申诉率 | 用户认为误判的比例 | 监控 |
| 判题失败率 | AI/静态判题异常导致提交失败 | 下降 |
| 提交接口 P95 延迟 | 用户等待判题时长 | 可接受 |

---

## 十四、资源需求

| 角色 | 投入 |
|------|------|
| 后端 | 1 人 × 2~3 周 |
| 前端 | 1 人 × 2~3 周 |
| 产品/教研 | 0.5 人 × 持续（模板题、Rubric） |
| AI/Prompt | 0.5 人 × 1~2 周 |

---

## 十五、决策建议

### 建议批准的理由

1. 解决进度不可信的真实痛点
2. 与「AI + 路线图 + 实战练习」定位一致
3. 可分 3 期，MVP 2~3 周可见效果
4. 基于现有架构扩展，非推倒重来
5. 提交记录可支撑运营与个性化

### 需拍板事项

| # | 问题 | 建议 |
|---|------|------|
| 1 | 是否接受「必须提交代码才算完成」 | ✅ 是 |
| 2 | MVP 范围 | 先做「组件与状态管理」1 个阶段 |
| 3 | 判题方式 | MVP 用 AI + 静态规则，不等沙箱 |
| 4 | 阶段跳过 | Phase 3 再考虑前置测评 |

---

## 十六、与现状代码对照

| 维度 | 现状 | 改造后 |
|------|------|--------|
| 完成触发 | 聊天结束 AI 提取 | 提交代码 + 判题通过 |
| 进度可信度 | 低 | 高 |
| 可审计性 | 无 | 每次提交有记录 |
| 聊天价值 | 讲解 + 误推进度 | 专注讲解 |
| 解锁逻辑 | AI 推断 + 关键词 | 服务端状态机 |
| 真相源 | `LearningProgress` JSON | `LessonProgress` + submissions |

### 需修改的关键文件（实施参考）

| 文件 | 改动类型 |
|------|----------|
| `prisma/schema.prisma` | 新增模型 |
| `lib/learning/roadmap-catalog.ts` | 扩展 exercise 模板 |
| `app/api/chat/api/handler.ts` | 弱化 `updateLearningProgress` |
| `app/api/chat/prompts/learning-prompts.ts` | 移除 roadmap 写入指令 |
| `lib/learning/roadmap-view.ts` | 改读聚合进度 |
| `lib/learning/home-dashboard.ts` | dailyTasks 改读 active exercise |
| 新增 `app/api/learning/exercises/*` | 出题/提交 API |

---

## 十七、待 Codex 评审 / 开放问题

> **本节供 Codex 重点补充**：请评审以上方案是否完整，并对下列开放问题给出建议。

### 17.1 产品层

- [x] MVP 阶段选哪几个 lesson 作为首批模板题？  
  建议与 `ROADMAP_CATALOG[1].lessons` 完全对齐：`JSX 语法与渲染逻辑`、`Hooks 进阶: useEffect & useContext`、`性能优化：useMemo & useCallback`。
- [x] 未通过是否限制重试次数？是否展示「查看参考答案」？  
  MVP 不限制总次数，但限制频率：同一 exercise 至少间隔 10 秒，每日最多 30 次。参考答案通过后展示；失败 3 次后只展示提示，不直接给完整答案。
- [x] 是否允许用户在聊天中提交代码代替练习区提交？  
  不允许。聊天可以粘代码问问题，但不推进进度；只有 submit API 可以触发判题和解锁。
- [x] 老用户已有 AI 生成的 `roadmapSteps=done` 如何迁移？  
  不全量清零。建议保留为 legacy 展示数据，但新状态机从第一个 active lesson 初始化；旧 `done` 不自动转为 `PASSED`，避免把不可信进度带入新系统。

### 17.2 技术层

- [x] 代码编辑器选型：MVP 用 CodeMirror。当前项目已有 CodeMirror 依赖，不引入 Monaco。
- [x] 出题 API：MVP 不做出题 API；首次进入 current exercise 时从模板题初始化。
- [x] `generateObject` 判题模型：可先沿用现有聊天模型，但 temperature 固定 0~0.2，记录 `model` 和 `promptVersion`，后续根据误判率再升级。
- [x] 静态检查实现：优先 AST；MVP 可为少量题实现轻量规则，但不要只靠字符串正则判定最终通过。
- [x] `revalidatePath` 范围：提交成功后至少刷新 `/home`、`/home/roadmap`、当前 `/home/[id]/ai`。
- [x] 并发提交：Redis lock + DB transaction；拿不到锁返回「正在判题，请稍后」。

### 17.3 安全层

- [x] 提交代码是否需消毒：存原文，展示时只作为文本/代码块渲染；禁止对用户代码使用 `dangerouslySetInnerHTML`。
- [x] API rate limit：MVP 放 Redis/service 层，按 `userId + exerciseId` 和 `userId` 两个维度限制。
- [x] 用户能否通过篡改客户端响应伪造 `passed`：不能。submit API 请求只接受 `exerciseId` 和 `code`，不接受 `passed/score/status`。

### 17.4 测试层

- [x] 单元测试必须覆盖：`finalizePassed`、静态检查、状态机边界、聚合器、非法跳关拒绝。
- [x] AI 判题 prompt：MVP 至少做 prompt snapshot + 3 个固定样例人工抽检；golden file 可 Phase 2 完善。
- [x] E2E 路径：必须覆盖登录 → 获取当前练习 → 提交通过 → 路线图变绿；另加空聊不推进。

### 17.5 文档层（本方案可能缺失）

- [ ] 模板题内容文档（教研用）
- [ ] 判题 prompt 规范文档
- [ ] 数据迁移 runbook
- [ ] 上线回滚方案
- [ ] 监控告警（判题失败率、API 延迟）

### 17.6 Codex 评审输出格式建议

请 Codex 按以下结构回复：

```markdown
## 评审结论
- [ ] 方案可执行 / 需修订 / 不建议

## 必须补充项（阻塞 MVP）
1. ...

## 建议补充项（不阻塞 MVP）
1. ...

## 对开放问题的建议
...

## 修订后的优先级调整（如有）
...
```

---

## 十八、Codex 补充评审与 Cursor 落地约束

### 18.1 最终落地结论

方案可以落地，但 Cursor 实施时必须按「小 MVP」推进，不要一次性做完整 OJ、AI 出题、React 沙箱和运营看板。

MVP 的唯一目标是证明：

```
固定模板题
  → 用户提交代码
  → 静态规则 + AI 判题
  → 服务端最终裁决
  → 状态机解锁下一课
  → 路线图和首页任务同步变化
```

### 18.2 阻塞 MVP 的硬约束

| # | 约束 | 原因 |
|---|------|------|
| 1 | Catalog 必须先补 `stageKey/lessonKey/templateId` | 防止标题变更导致进度失效 |
| 2 | MVP 不做 AI 生成题 | 降低题目质量、缓存、复现、成本风险 |
| 3 | 聊天 API 不得写完成状态 | 彻底解决空聊误完成 |
| 4 | submit API 只接受 `exerciseId/code` | 防止客户端伪造分数或 passed |
| 5 | 状态推进必须在 DB transaction 内完成 | 防止半成功状态 |
| 6 | 同一 exercise 提交要加并发锁 | 防止双提交覆盖状态 |
| 7 | 用户代码展示必须按文本渲染 | 防 XSS |
| 8 | 必须有空聊不推进的测试 | 防旧问题回归 |

### 18.3 Cursor 不应做的事

- 不要把 `LearningProgress.roadmapSteps` 继续作为真实进度源。
- 不要让 AI 直接决定 lesson/stage 状态。
- 不要在 MVP 引入 Monaco，优先复用现有 CodeMirror。
- 不要新增 `/generate` 出题接口。
- 不要把聊天窗口里的代码粘贴当作练习提交。
- 不要让前端传 `score`、`passed`、`status`。
- 不要用纯 prompt 约束替代服务端状态机。

### 18.4 推荐文件拆分

```text
lib/learning/exercise-catalog.ts
  固定模板题、rubric、starterCode、staticCheck 配置

lib/learning/static-checks.ts
  静态检查实现，MVP 可先支持 3 道题需要的规则

lib/learning/grading-service.ts
  AI 判题、finalizePassed、criteria 合并

lib/learning/progress-state-machine.ts
  onExercisePassed、unlockNextLesson、非法跳关检查

lib/learning/progress-aggregator.ts
  从 LessonProgress/LearningExercise 聚合写 LearningProgress 展示缓存

lib/repositories/exercise-repository.ts
  Exercise / Submission / LessonProgress 的 DB 读写

app/api/learning/exercises/current/route.ts
  获取或初始化当前 active exercise

app/api/learning/exercises/submit/route.ts
  提交代码、判题、推进状态
```

### 18.5 最小验收清单

- [ ] 新用户进入路线图时，只有第一个 MVP lesson active，其余 locked。
- [ ] 只聊天 3 轮，不提交代码，路线图状态不变。
- [ ] 提交空代码或明显错误代码，不解锁下一课。
- [ ] 提交满足必选项的代码，当前 exercise 变 `PASSED`。
- [ ] 当前 lesson 全部 exercise passed 后，下一 lesson 自动 active。
- [ ] 前端篡改响应或请求体传 `passed=true` 无效。
- [ ] 连续双击提交只产生一个正在处理的判题流程。
- [ ] `/home` 今日任务展示当前 active exercise，而不是 AI 随机 dailyTasks。
- [ ] `npm run build` 通过。
- [ ] 至少有一条 E2E 覆盖登录到解锁。

---

## 附录 A：Executive Summary（1 页纸）

**问题**：LingStack 学习进度由 AI 在聊天后自动推断，「聊过」可能被标为「学过」，进度不可信。

**方案**：引入练习关卡——AI 出题，用户必须提交代码，AI+规则判题，服务端裁决通过后解锁下一课。

**价值**：进度可验证、可审计、可运营；聊天回归讲解本职。

**成本**：2~3 周 MVP（1 个阶段），后端+前端各 1 人。

**风险**：AI 判题准确度；对策为模板题 + 静态规则 + 允许重试。

**决策**：建议批准 MVP，范围限定「组件与状态管理」阶段。

---

## 附录 B：MVP 模板题清单（草案）

| Lesson | Exercise ID | 标题 | 难度 |
|--------|-------------|------|------|
| JSX 语法与渲染逻辑 | `jsx-basics-render` | 用 JSX 渲染列表 | 入门 |
| Hooks: useEffect & useContext | `hooks-effect-cleanup` | useEffect 清理函数 | 中级 |
| 性能优化：useMemo & useCallback | `perf-memo-callback` | 用 memo 优化子组件 | 中级 |

### B.1 `jsx-basics-render`

**lessonKey**：`jsx-rendering`  
**目标**：验证用户能用 JSX、props/list rendering、`key` 完成基础渲染。

**题目**：实现 `SkillList` 组件，接收 `skills` 数组并渲染学习技能列表。

**starterCode**：

```tsx
type Skill = {
  id: string;
  name: string;
  level: "beginner" | "intermediate" | "advanced";
};

type SkillListProps = {
  skills: Skill[];
};

export function SkillList({ skills }: SkillListProps) {
  return (
    <section>
      {/* 在这里渲染技能列表 */}
    </section>
  );
}
```

**requirements**：

1. 必须使用 `skills.map(...)` 渲染列表。
2. 每个列表项必须有稳定 `key`，优先使用 `skill.id`。
3. 必须展示 `skill.name`。
4. 必须根据 `skill.level` 展示不同文本或 className。
5. 空数组时要展示空状态文案。

**rubric**：

| criteriaId | 名称 | 权重 | required | staticCheck |
|------------|------|------|----------|-------------|
| `uses-map` | 使用 map 渲染列表 | 25 | ✅ | `contains-array-map` |
| `has-key` | 列表项有 key | 25 | ✅ | `jsx-list-has-key` |
| `renders-name` | 展示技能名称 | 20 | ✅ | `references-skill-name` |
| `handles-level` | 处理 level 展示 | 15 | ❌ | `references-skill-level` |
| `handles-empty` | 处理空状态 | 15 | ❌ | `has-empty-state-branch` |

**passScore**：70  
**requiredCriteriaIds**：`uses-map`、`has-key`、`renders-name`

### B.2 `hooks-effect-cleanup`

**lessonKey**：`hooks-effect-context`  
**目标**：验证用户理解 `useEffect` 副作用、依赖数组和清理函数。

**题目**：实现 `SessionTimer` 组件，每秒递增学习时长，并在组件卸载时清除定时器。

**starterCode**：

```tsx
import { useEffect, useState } from "react";

export function SessionTimer() {
  const [seconds, setSeconds] = useState(0);

  return (
    <div>
      已学习 {seconds} 秒
    </div>
  );
}
```

**requirements**：

1. 必须使用 `useEffect` 创建定时器。
2. 必须使用 `setInterval` 或等价定时机制每秒更新一次。
3. 必须在 `useEffect` 中 `return` 清理函数。
4. 清理函数必须调用 `clearInterval` 或等价清理逻辑。
5. 依赖数组不能导致重复创建无限定时器。

**rubric**：

| criteriaId | 名称 | 权重 | required | staticCheck |
|------------|------|------|----------|-------------|
| `uses-effect` | 使用 useEffect | 25 | ✅ | `contains-use-effect` |
| `creates-interval` | 创建定时器 | 20 | ✅ | `contains-set-interval` |
| `has-cleanup` | 返回清理函数 | 30 | ✅ | `has-effect-cleanup-return` |
| `clears-interval` | 清除定时器 | 15 | ✅ | `contains-clear-interval` |
| `reasonable-deps` | 依赖数组合理 | 10 | ❌ | AI 判定 |

**passScore**：75  
**requiredCriteriaIds**：`uses-effect`、`creates-interval`、`has-cleanup`、`clears-interval`

### B.3 `perf-memo-callback`

**lessonKey**：`perf-memo-callback`  
**目标**：验证用户知道何时使用 `useMemo`、`useCallback` 和 `memo` 减少不必要渲染。

**题目**：优化 `LearningDashboard`，避免每次输入搜索词时都重新计算昂贵统计，并减少子组件无意义重渲染。

**starterCode**：

```tsx
import { useState } from "react";

type Lesson = {
  id: string;
  title: string;
  minutes: number;
  completed: boolean;
};

function ProgressSummary({
  completedCount,
  totalMinutes,
  onReset,
}: {
  completedCount: number;
  totalMinutes: number;
  onReset: () => void;
}) {
  return (
    <section>
      <p>已完成 {completedCount} 节</p>
      <p>累计 {totalMinutes} 分钟</p>
      <button onClick={onReset}>重置</button>
    </section>
  );
}

export function LearningDashboard({ lessons }: { lessons: Lesson[] }) {
  const [query, setQuery] = useState("");

  const completedCount = lessons.filter((lesson) => lesson.completed).length;
  const totalMinutes = lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);

  function handleReset() {
    setQuery("");
  }

  const visibleLessons = lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      <ProgressSummary
        completedCount={completedCount}
        totalMinutes={totalMinutes}
        onReset={handleReset}
      />
      <ul>
        {visibleLessons.map((lesson) => (
          <li key={lesson.id}>{lesson.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

**requirements**：

1. 必须用 `useMemo` 缓存 `completedCount` 或统计对象。
2. 必须用 `useMemo` 缓存 `totalMinutes` 或统计对象。
3. 必须用 `useCallback` 缓存传给子组件的 `onReset`。
4. `ProgressSummary` 应使用 `memo` 包裹或等价方式减少重渲染。
5. 依赖数组必须包含正确依赖，不能为了通过检查写空数组。

**rubric**：

| criteriaId | 名称 | 权重 | required | staticCheck |
|------------|------|------|----------|-------------|
| `uses-usememo` | 使用 useMemo 缓存统计 | 30 | ✅ | `contains-use-memo` |
| `uses-usecallback` | 使用 useCallback 缓存回调 | 25 | ✅ | `contains-use-callback` |
| `memoizes-child` | 子组件 memo 化 | 20 | ❌ | `contains-react-memo` |
| `correct-deps` | 依赖数组合理 | 20 | ✅ | AI 判定 |
| `keeps-behavior` | 保持搜索和重置行为 | 5 | ❌ | AI 判定 |

**passScore**：75  
**requiredCriteriaIds**：`uses-usememo`、`uses-usecallback`、`correct-deps`

---

*文档维护：LingStack 团队 · 最后更新：2026-06-21*
