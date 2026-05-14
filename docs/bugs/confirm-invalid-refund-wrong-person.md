# confirm_invalid 退款给错人

## 日期

2026-05-14

## 严重程度

高 — 导致用户余额错误，且涉及核心资金流

## 现象

借票被确认无效（`confirmed_invalid`）后，退款没有退给借款人，而是退给了上传者。

具体案例：
- Alice 借了 alvin 的票，确认为无效 → alvin 余额多出 5 分
- Alice 没有被退款，余额少了 5 分

## 根因

`supabase/migrations/002_create_functions.sql` 中 `confirm_result` 函数的 invalid 分支：

```sql
-- 注释说：refund points to borrower
-- 但 WHERE 条件写的是上传者！
update public.users
set points_balance = points_balance + v_transaction.points_amount,
    reputation = greatest(reputation - 10, 0)
where id = v_ticket.uploader_id;  -- BUG: 应该是 v_transaction.borrower_id
```

注释和代码不一致。注释写的是"退款给借款人"，但 `WHERE` 条件却指向了 `v_ticket.uploader_id`（上传者），导致退款进了上传者的账户。

## 修复

在 006 迁移中重写了 `confirm_result` 函数，根本性解决了这个问题：

- **借票时**：不再立即扣款，只创建 pending 交易
- **确认有效时**：扣借款人 + 加给上传者
- **确认无效/过期时**：不动账（因为没扣过款，不存在退款需求）

新的 `confirm_invalid` 代码：
```sql
else
    -- NO money was moved, just record the failure
    update public.users
    set reputation = greatest(reputation - 10, 0)
    where id = v_ticket.uploader_id;
    ...
```

## 影响文件

- `supabase/migrations/002_create_functions.sql` — 原始 bug（旧版本，已被替换）
- `supabase/migrations/006_fix_pending_points.sql` — 修复（新版本，当前生效）

## 数据修复

受影响的用户余额已手动修正：
- Alice: 退款 5 分（0 → 5）
- alvin: 扣除错误退款 5 分（20 → 15）

## 为什么不会再出现

新架构下借票时不动账，确认无效也无需退款，从根本上消除了"退款给错人"的可能性。函数已被 `CREATE OR REPLACE` 覆盖，不会回退。
