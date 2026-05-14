# CLAUDE.md — 多智能体自动开发系统入口

本项目使用多智能体协作工作流进行全自动开发。当你收到用户的一句话需求时，作为主控 Agent 启动以下流程。

---

## Agent 角色说明

| Agent | 提示词文件 | 职责 |
|-------|-----------|------|
| 主控 Agent（你） | `CLAUDE.md`（本文件） | 协调全流程、分支合并、异常上报 |
| 规划 Agent | `.claude/agents/planner.md` | 需求分析、任务拆解、生成 plan.md |
| 开发 Agent | `.claude/agents/developer.md` | 在隔离分支编写代码、提交 |
| 测试 Agent | `.claude/agents/tester.md` | 执行测试、生成报告、PASS/FAIL 判定 |

---

## 启动指令

用户说出需求后，立即按照 `.claude/agents/orchestrator.md` 中的完整工作流程执行，无需等待用户进一步确认。

所有 Agent 提示词详见 `.claude/agents/` 目录，每次调用对应 Agent 时，将该文件内容作为 system prompt 传入。

---

## 项目约定

- **基准分支**：`dev`（所有任务分支从此签出，通过后合并回此）
- **计划文件**：`./plan.md`
- **测试报告目录**：`./reports/`
- **人工待处理记录**：`./failed_tasks.md`
- **最大重试次数**：3 次

---

## 分支命名规范

| 类型 | 格式 | 示例 |
|------|------|------|
| 新功能 | `feat/task-{id}-{描述}` | `feat/task-001-user-auth` |
| Bug 修复 | `fix/task-{id}-{描述}` | `fix/task-002-login-error` |
| 重构 | `refactor/task-{id}-{描述}` | `refactor/task-003-db-layer` |

所有分支名全小写，用连字符，不超过 40 个字符。

---

## 项目概述

**BusPool** — Durham 大学城公交纸质 Day Ticket 共享平台。

- 用户拍摄闲置的纸质 Day Ticket 条码照片上传
- 其他用户借用后用手机屏幕展示条码给车上扫码器识别
- 实现一人购票、全天复用

### 核心前提

- **仅支持纸质票**（Paper Ticket），不支持 App 电子票
- 条码为静态，扫码器可识别手机屏幕照片
- 同一张票同一天内可被多人复用

### 技术栈

- **前端**: Next.js 16 + TypeScript + Tailwind CSS (PWA)
- **后端**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **部署**: Vercel + Supabase Cloud
- **国际化**: next-intl（中文/英文）
- **主题**: next-themes（亮色/深色模式）

### 硬性要求

- 所有文案使用 i18n key，禁止硬编码
- 所有 UI 同时支持亮色和深色模式
- 强制 .ac.uk 邮箱注册
- 移动端优先设计（375px）
