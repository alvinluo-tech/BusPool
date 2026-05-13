This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



# BusPool - 公交日票共享平台

## 项目概述
Durham 大学城公交 day ticket 共享平台。用户上传闲置的 day ticket 条码照片，其他用户可借用，实现一人购票、多人复用。

## 技术栈
- **前端**: Next.js 16 + TypeScript + Tailwind CSS
- **后端**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **部署**: Vercel (前端) + Supabase Cloud (后端)

## 项目结构
```
src/
├── app/              # Next.js App Router
│   ├── (auth)/       # 登录/注册页面
│   ├── (main)/       # 主要功能页面
│   │   ├── tickets/  # 票务相关
│   │   ├── profile/  # 用户中心
│   │   └── wallet/   # 积分钱包
│   └── api/          # API Routes
├── components/       # 公共组件
├── lib/              # 工具函数、Supabase 客户端
├── hooks/            # 自定义 Hooks
└── types/            # TypeScript 类型定义
```

## 核心规则
- 所有页面移动端优先设计
- 使用 Supabase Row Level Security 控制数据权限
- 条码照片存储在 Supabase Storage，访问权限严格控制
- 积分系统：上传者获积分，借用者扣积分，确认有效后结算
- 信誉系统：追踪每张票的有效率，低于阈值禁止上传
