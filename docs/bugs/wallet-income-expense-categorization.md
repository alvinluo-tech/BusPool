# Wallet 收入/支出分类错误

## 日期

2026-05-14

## 严重程度

中 — 交易记录显示正确但统计卡片和筛选分类错误

## 现象

1. 钱包页顶部统计卡片 income/expense 金额与实际交易方向不符（借了两次票却显示 +5 income、-5 expense）
2. 筛选标签（All / Income / Expense）分类错误，部分借票交易被归类到 income
3. 从上传者视角，共享出去的票也被错误分类

## 根因

`src/app/(main)/wallet/page.tsx` 中 income/expense 的分类逻辑使用了 `status` 字段而不是 `borrower_id`：

```ts
// 错误：用 status 判断方向
const totalIncome = transactions
  .filter((tx) => tx.status !== "confirmed_valid")  // pending/failed 被当成收入
  .reduce((sum, tx) => sum + tx.points_amount, 0);

const totalExpense = transactions
  .filter((tx) => tx.status === "confirmed_valid")
  .reduce((sum, tx) => sum + tx.points_amount, 0);
```

`transactions` 表没有 `uploader_id` 列，交易方向只能通过 `borrower_id` 判断：
- `borrower_id === userId` → 用户是借票方 → 支出
- `borrower_id !== userId` → 用户是上传者 → 收入

但原代码用 `status === "confirmed_valid"` 来决定方向，导致：
- 一笔 pending 状态的借票被归为 income（实际是支出）
- 统计卡片金额与下方逐条记录显示不一致（逐条记录已正确使用 `isExpense = tx.borrower_id === userId`）

## 修复

将统计卡片和筛选标签的分类逻辑统一为 `borrower_id === userId`：

```ts
// 正确：用 borrower_id 判断方向
const totalIncome = transactions
  .filter((tx) => tx.borrower_id !== userId)
  .reduce((sum, tx) => sum + tx.points_amount, 0);

const totalExpense = transactions
  .filter((tx) => tx.borrower_id === userId)
  .reduce((sum, tx) => sum + tx.points_amount, 0);

const filtered = transactions.filter((tx) => {
  const isExpense = tx.borrower_id === userId;
  if (filter === "income") return !isExpense;
  if (filter === "expense") return isExpense;
  return true;
});
```

## 影响文件

- `src/app/(main)/wallet/page.tsx` — 第 83-95 行

## 关联修复

同一次排查中还修复了：
- `borrows/page.tsx` 和 `wallet/page.tsx` 使用了不存在的 FK `transactions_uploader_id_fkey`，改为通过 `tickets` 表嵌套 join：`ticket:tickets(uploader:users!tickets_uploader_id_fkey(nickname))`
- `borrows/page.tsx` 中 `tx.uploader?.nickname` 改为 `tx.ticket?.uploader?.nickname`（uploader 在 ticket 内而非 transaction 顶层）
