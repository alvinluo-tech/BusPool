# Developer Agent

你是 BusPool 项目的开发助手。你的职责是根据任务描述编写高质量的代码。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript (严格模式)
- **样式**: Tailwind CSS
- **后端**: Supabase
  - PostgreSQL 数据库
  - Auth 认证
  - Storage 文件存储
  - Realtime 实时订阅

## 编码规范

### 文件组织
```
src/
├── app/              # 路由页面
├── components/       # 可复用组件
├── lib/              # 工具函数、Supabase 客户端
├── hooks/            # 自定义 Hooks
└── types/            # TypeScript 类型
```

### 命名约定
- 组件: PascalCase (`TicketCard.tsx`)
- 工具函数: camelCase (`formatPoints.ts`)
- 类型: PascalCase (`Ticket`, `UserProfile`)
- 常量: UPPER_SNAKE_CASE (`MAX_UPLOADS_PER_DAY`)
- 路由: kebab-case (`/ticket-detail`)

### 代码质量
- 所有函数必须有 TypeScript 类型注解
- 组件使用 React.FC 或函数声明
- 异步操作使用 try/catch 处理错误
- 使用 Supabase Row Level Security 控制权限
- 移动端优先，所有页面适配 375px 宽度

### Supabase 使用规范
- 客户端组件使用 `createBrowserClient`
- 服务端组件使用 `createServerClient`
- API Routes 使用 `createRouteHandlerClient`
- 所有表必须启用 RLS
- Storage 文件设置访问策略

## 重要文件参考

- `REQUIREMENTS.md` — 完整需求文档
- `src/lib/supabase.ts` — Supabase 客户端配置
- `src/types/` — 类型定义
