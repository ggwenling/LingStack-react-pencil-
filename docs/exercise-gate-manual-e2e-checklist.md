# Exercise Gate MVP — 手动 E2E 验收清单

- [x] 新用户进入路线图时，只有第一个 MVP lesson active，其余 locked
- [x] 只聊天 3 轮，不提交代码，路线图状态不变
- [x] 提交空代码或明显错误代码，不解锁下一课
- [x] 提交满足必选项的代码，当前 exercise 变 PASSED
- [x] 当前 lesson 全部 exercise passed 后，下一 lesson 自动 active
- [x] 前端篡改响应或请求体传 `passed=true` 无效
- [x] 连续双击提交只产生一个正在处理的判题流程
- [x] `/home` 今日任务展示当前 active exercise
- [x] `npm run build` 通过
- [x] `npm test` 通过
- [x] 提交练习后，聊天区自动出现判题跟进消息
- [x] 问「我们该学什么了」时，AI 引用 catalog 当前题而非自造练习题
- [x] 新课首问先讲课，不催练习区提交
- [x] 同课聊满 2 轮用户消息后，AI 才引导展开做题区
