# Button 嵌套 Button 导致 HTML 非法嵌套

## 日期

2026-05-15

## 严重程度

中 — 运行时不会报错但 HTML 语义非法，点击行为异常（外层按钮的事件被内层按钮意外触发）

## 现象

设置页面 `settings/page.tsx` 中：
- Toggle 组件（开关）渲染在 MenuItem 组件（菜单项）内部
- 点击 Toggle 切换开关时，会同时触发外层 MenuItem 的 `onClick` 事件
- HTML 结构违反规范：`<button>` 内部嵌套 `<button>` 是非法的

## 根因

**AI 生成组件时是逐个独立生成的，缺乏全局组件树视角：**

1. AI 生成 `MenuItem` → 使用 `<button>` 作为容器（合理，它是一个可点击的行）
2. AI 生成 `Toggle` → 使用 `<button>` + `role="switch"`（合理，它是一个交互式开关）
3. 开发者将两者组合 → `MenuItem` 包含 `Toggle` → `<button>` 内嵌 `<button>` → 非法

```tsx
// MenuItem 中的 button
<button type="button" onClick={...} className="...">
  {/* Toggle 中的 button — 嵌套！ */}
  {rightIcon === "toggle" && (
    <button type="button" role="switch" aria-checked={checked} onClick={onChange}>
      ...
    </button>
  )}
</button>
```

**为什么 AI 特别容易犯这个错：**

- AI 的训练数据中，"可点击的东西用 button" 是高频模式
- 但 "button 不能嵌 button" 这个约束在组合场景下才会暴露，AI 在独立生成每个组件时看不到
- 每个组件单独看都正确，组合后才出错——这正是 AI 的首位盲区

## 修复

两处改动：

**1. Toggle 的 `button` 改为 `div`（解决嵌套）：**

```tsx
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation()  // 阻止冒泡到外层 MenuItem 的 button
        onChange()
      }}
      className={`relative w-11 h-6 rounded-full shrink-0 transition-colors duration-200 cursor-pointer ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <div className={`... ${checked ? "translate-x-5" : "translate-x-1"}`} />
    </div>
  )
}
```

**2. `e.stopPropagation()` 阻止冒泡（解决事件穿透）：**

因为 Toggle 内嵌在 MenuItem 的 `<button>` 内部，点击 Toggle 时 DOM 事件会冒泡到外层 `<button>`，触发 MenuItem 的 `onClick`。`stopPropagation()` 阻止这个行为。

## 影响文件

- `src/app/(main)/settings/page.tsx` — 第 37-49 行（Toggle 组件）
- `src/app/(main)/settings/notifications/page.tsx` — 同样的 Toggle 组件（如果重复定义）

## 同类问题

| 问题 | 说明 |
|---|---|
| `button` 嵌 `button` | 本次遇到的 |
| `a` 标签嵌 `a` 标签 | 同理，链接嵌套 |
| `p` 标签里放 `div` | 块元素不能在行内元素里 |
| hydration 不匹配 | 服务端/客户端渲染结果不一致 |
| `useEffect` 依赖数组缺失 | AI 经常漏写 |

## 预防措施

1. **生成组件时提供上下文** — 告知 AI 该组件会被放在什么容器内，有什么约束
2. **生成后追问** — "这段代码有没有 HTML 嵌套规范问题？有没有 hydration 问题？"
3. **ESLint 实时检测** — `eslint-plugin-jsx-a11y` 已在项目中启用，`next/core-web-vitals` 内置 jsx-a11y 推荐规则
