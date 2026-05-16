# 部署 404 错误：next-intl 中间件路由冲突

## 症状
将应用部署到 Vercel 后，访问任何页面都会返回 404 错误。

## 根本原因
项目在 Next.js 的 `middleware.ts`（具体为 `src/lib/supabase/middleware.ts`）中使用了 `next-intl/middleware` 来处理国际化（i18n）路由。
即使在 `routing.ts` 中配置了 `localePrefix: "never"`，`next-intl` 中间件在底层依然会将传入的请求 URL 重写，加上语言前缀（例如将 `/` 重写为 `/en`）。

因为 Next.js App Router 的目录结构（`src/app/`）中并没有包含 `[locale]` 动态路由文件夹（即没有类似于 `src/app/[locale]/page.tsx` 的结构），App Router 找不到与重写后的路径相匹配的路由。因此，所有页面请求最终都会导致 404 Not Found。

## 修复方案
由于应用是直接在服务端通过读取 `NEXT_LOCALE` Cookie 来确定语言（见 `src/i18n/request.ts`），并不依赖 URL 前缀，因此不需要这个重写路由的中间件。

1. 从 `src/lib/supabase/middleware.ts` 中移除了 `next-intl/middleware` 包装器（`handleI18nRouting`）。
2. 直接初始化 `response = NextResponse.next()`，确保请求 URL 不被重写，同时保留 Supabase Auth 验证功能。
3. 将根目录的 `middleware.ts` 移动到 `src/middleware.ts`，以符合 Next.js 的标准规范。

## 受影响的文件
- `src/middleware.ts`（从根目录移入）
- `src/lib/supabase/middleware.ts`
- `src/i18n/request.ts`