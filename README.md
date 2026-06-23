# LingStack Desktop

基于 Next.js 16 的 React / Next.js 学习工作台，包含邮箱登录、GitHub OAuth、AI 流式对话与学习进度记录。

## 本地开发

1. 复制环境变量模板并按需填写：

```bash
cp .env.example .env
```

2. 安装依赖并启动数据库迁移：

```bash
npm install
npm run db:migrate
```

3. 启动开发服务器：

```bash
npm run dev
```

浏览器访问 [http://localhost:3000](http://localhost:3000)。

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `DATABASE_URL` | 是 | PostgreSQL 连接串 |
| `DEEPSEEK_API_KEY` | 是 | DeepSeek API 密钥 |
| `DEEPSEEK_BASE_URL` | 是 | DeepSeek API 地址 |
| `GITHUB_CLIENT_ID` | 否 | GitHub OAuth Client ID |
| `GITHUB_CLIENT_SECRET` | 否 | GitHub OAuth Client Secret |
| `APP_URL` | 否 | 应用公网地址，默认 `http://localhost:3000` |
| `SMTP_HOST` | 否* | SMTP 服务器，QQ 邮箱为 `smtp.qq.com` |
| `SMTP_PORT` | 否 | SMTP 端口，QQ 邮箱 SSL 一般为 `465` |
| `SMTP_SECURE` | 否 | 是否启用 SSL，`465` 端口填 `true` |
| `SMTP_USER` | 否* | SMTP 登录邮箱，如 `3118027323@qq.com` |
| `SMTP_PASS` | 否* | QQ 邮箱 **授权码**（不是登录密码） |
| `SMTP_FROM` | 否 | 发件人显示名，默认 `LingStack <SMTP_USER>` |

\* 使用「重置密码 / 验证码」功能时需配置 `SMTP_*` 与 `REDIS_*`。

| `REDIS_HOST` | 否* | Upstash Redis REST URL，如 `https://xxx.upstash.io` |
| `REDIS_TOKEN` | 否* | Upstash Redis REST Token |
| `REDIS_PORT` | 否 | REST 模式下可忽略 |

### QQ 邮箱 SMTP 配置示例

在 QQ 邮箱 **设置 → 账户** 中开启 SMTP，获取授权码后写入 `.env`：

```env
APP_URL=http://localhost:3000
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=3118027323@qq.com
SMTP_PASS=你的16位授权码
SMTP_FROM=LingStack <3118027323@qq.com>

REDIS_HOST=https://your-upstash.upstash.io
REDIS_TOKEN=your_upstash_token
```

密码重置流程：访问 `/login/reset-password` → 输入邮箱并发送 6 位验证码（Redis 保存 3 分钟）→ 填写新密码与验证码完成重置。

## 部署

1. 在部署平台配置上述环境变量。
2. 确保 PostgreSQL 可访问，并在发布流程中执行数据库迁移：

```bash
npm run db:migrate
```

3. 构建并启动：

```bash
npm run build
npm run start
```

`npm install` 和 `npm run build` 会自动执行 `prisma generate` 生成 Prisma Client。

## 认证说明

- 邮箱登录与注册通过 **Server Action** 完成，不依赖 REST 登录接口。
- AI 对话使用 `POST /api/chat`。
- GitHub 登录使用 `/api/auth/github` 与 `/api/auth/github/callback`。
- `/home` 路由由 `proxy.ts` 保护，会校验 session 是否有效，无效时清除 cookie 并重定向到登录页。
