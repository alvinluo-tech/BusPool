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
- **国际化**: next-intl 或 i18next
- **主题**: next-themes (深色模式)

## Git 分支策略

```
main          ← 稳定版本，只接受合并
├── develop   ← 开发主分支，所有功能分支合并到这里
│   ├── feat/ticket-upload      ← 上传票功能
│   ├── feat/borrow-flow        ← 借用流程
│   ├── feat/points-system      ← 积分系统
│   ├── feat/reputation         ← 信誉系统
│   ├── feat/i18n               ← 国际化
│   ├── feat/dark-mode          ← 深色模式
│   └── fix/xxx                 ← 修复分支
```

### 分支规则
- **严禁直接在 `main` 或 `develop` 上开发**
- 每个功能/修复必须创建独立分支
- 分支命名: `feat/功能名` 或 `fix/问题描述`
- 完成后通过 PR 合并到 `develop`
- `develop` 稳定后合并到 `main`
- commit message 遵循 Conventional Commits 规范

## 编码规范

### 文件组织
```
src/
├── app/              # 路由页面
├── components/       # 可复用组件
├── lib/              # 工具函数、Supabase 客户端
├── hooks/            # 自定义 Hooks
├── types/            # TypeScript 类型
├── i18n/             # 国际化配置
│   ├── locales/      # 语言包 (zh.json, en.json)
│   └── request.ts    # i18n 请求配置
└── styles/           # 全局样式
```

### 命名约定
- 组件: PascalCase (`TicketCard.tsx`)
- 工具函数: camelCase (`formatPoints.ts`)
- 类型: PascalCase (`Ticket`, `UserProfile`)
- 常量: UPPER_SNAKE_CASE (`MAX_UPLOADS_PER_DAY`)
- 路由: kebab-case (`/ticket-detail`)
- i18n key: kebab-case (`ticket.upload.success`)

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

## ⚠️ 三大硬性要求（必须遵守）

### 1. 禁止硬编码文案
```tsx
// ❌ 错误：硬编码中文
<h1>票务广场</h1>
<p>暂无可用票</p>

// ✅ 正确：使用 i18n
import { useTranslations } from 'next-intl';

export default function TicketSquare() {
  const t = useTranslations('ticketSquare');
  return (
    <h1>{t('title')}</h1>
    <p>{t('emptyState')}</p>
  );
}
```

语言包文件结构 (`src/i18n/locales/zh.json`):
```json
{
  "ticketSquare": {
    "title": "票务广场",
    "emptyState": "暂无可用票，稍后再来"
  }
}
```

### 2. 深色模式必须同步实现
```tsx
// ❌ 错误：只写亮色样式
<div className="bg-white text-gray-900">

// ✅ 正确：同时支持亮色和深色
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

**规则**：
- 所有颜色必须使用 Tailwind 的 `dark:` 变体
- 背景色、文字色、边框色、阴影都需要 dark 模式
- 使用 `next-themes` 的 `useTheme` hook 切换主题
- 主题切换按钮放在设置页面

### 3. 组件必须支持多语言布局
```tsx
// ❌ 错误：固定宽度，长文本会溢出
<div className="w-20">{t('button')}</div>

// ✅ 正确：弹性布局，适应不同语言文本长度
<div className="min-w-20 px-4">{t('button')}</div>
```

## 重要文件参考

- `REQUIREMENTS.md` — 完整需求文档
- `src/lib/supabase.ts` — Supabase 客户端配置
- `src/i18n/locales/zh.json` — 中文语言包
- `src/i18n/locales/en.json` — 英文语言包
- `src/types/` — 类型定义
