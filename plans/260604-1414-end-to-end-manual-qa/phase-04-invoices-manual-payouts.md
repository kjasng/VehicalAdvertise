# Phase 4: Earning theo tháng, invoices, và payout thủ công

## Liên kết ngữ cảnh

- [Plan tổng quan](./plan.md)
- Driver invoices: `src/app/driver/invoice/`
- Admin payouts: `src/app/admin/payouts/`
- Garage payouts: `src/app/garage/payout/`
- Manual payout migration: `supabase/migrations/0021_manual_payout_review.sql`

## Tổng quan

Ưu tiên: Critical  
Trạng thái: Pending  
Mục tiêu: Kiểm tra monthly earning materialisation, withdrawal invoices có thể in, request-time bank snapshots, và payout thủ công do admin duyệt.

## S. Giả lập một tháng Driver đã hoàn tất

Chỉ dùng staging SQL Editor. Dời earning start date lùi đúng một tháng:

```sql
update public.contracts
set earning_start_date = (current_date - interval '1 month')::date
where id = '<CONTRACT_ID>';
```

1. Ghi lại Partner balance, campaign spent amount, và Driver ledger trước khi mở Driver Invoices.
2. Mở `/driver/invoice`.
3. Refresh page hai lần.

Kết quả mong đợi:

- Tạo một row `driver_earning_periods` cho completed period.
- Tạo đúng một bộ ba ledger:
  - `partner_charge = -1,375,000 VND`
  - `platform_fee = 275,000 VND`
  - `driver_accrual = 1,100,000 VND`
- Partner balance và campaign spent amount thay đổi theo gross charge.
- Refresh không tạo duplicate periods hoặc ledger entries.

Ghi chú hành vi:

- Implementation hiện tại materialise earning khi invoice data được load, chưa tự chạy đúng thời điểm cuối tháng. Nếu cần true automatic accrual, ghi nhận đây là product gap.

## T. Driver tạo withdrawal invoice

Đường dẫn: `/driver/invoice`, `/driver/profile`

1. Trước khi hoàn tất payout settings, confirm invoice creation bị block.
2. Lưu Driver bank account name, number, bank name, optional branch/BIN.
3. Quay lại Driver Invoices và tạo withdrawal invoice.
4. Thử tạo lại invoice cho cùng period.
5. Đổi Driver bank account sau khi invoice đã được tạo.

Kết quả mong đợi:

- Tạo đúng một Driver invoice với status `requested`.
- Invoice amount bằng Driver net `1,100,000 VND`.
- Duplicate invoice cho cùng contract và period bị block.
- Admin Driver Invoices hiển thị request và printable HTML document.
- Admin Payouts dùng request-time bank snapshot, không dùng account profile mới đổi.

Kiểm tra defect dự kiến:

- Invoice creation hiện check bank fields nhưng có thể chưa bắt buộc `bank_verified_at`.

## U. Admin xử lý Driver manual payout

Đường dẫn: `/admin/payouts`

1. Tìm Driver request theo name, email, phone, hoặc bank account.
2. Approve withdrawal.
3. Thử approve lại từ tab khác.
4. Thực hiện external test transfer ngoài app.
5. Mark payout paid.
6. Refresh Driver Invoices.

Kết quả mong đợi sau approval:

- Driver invoice status chuyển thành `approved`.
- Payout status chuyển thành `processing`.
- Một ledger entry `driver_payout` reserve amount.
- Request biến mất khỏi approval queue.
- Duplicate approval bị block.

Kết quả mong đợi sau mark paid:

- Payout, Driver invoice, và earning period chuyển thành `paid`.
- Driver Total Paid Out được update.
- Mark Paid không thể lặp lại.

Kiểm tra defect dự kiến:

- Hiện chưa có Driver withdrawal rejection action.

## V. Garage tạo withdrawal request

Đường dẫn: `/garage/payout`

1. Lưu Garage payout settings.
2. Khi balance dưới configured minimum, xác nhận withdrawal bị block.
3. Đưa balance đạt minimum bằng một trong các cách test sau:
   - Full rule path: lặp lại approved installs đến khi balance đạt minimum.
   - Fast staging path: tạm thời hạ Garage Minimum Withdrawal sau khi đã check below-minimum.
4. Tạo withdrawal request.
5. Đổi Garage bank account sau khi tạo request.

Kết quả mong đợi:

- Request status là `pending`.
- Requested amount được reserve bằng cách giảm available garage balance.
- Garage invoice xuất hiện trong Admin Garage Invoices và có thể in.
- Admin thấy request-time bank snapshot.

## W. Admin xử lý Garage manual payout

Đường dẫn: `/admin/payouts`

Nhánh happy path:

1. Tìm Garage request theo garage name, email, phone, hoặc bank account.
2. Approve request.
3. Thực hiện external test transfer.
4. Mark paid.

Kết quả mong đợi:

- Trạng thái chuyển `pending → processing → paid`.
- Garage history hiển thị Admin approved, sau đó paid.
- Duplicate transitions bị block.

Nhánh reject/refund:

1. Tạo Garage withdrawal request thứ hai.
2. Reject với reason.

Kết quả mong đợi:

- Trạng thái chuyển thành `failed`.
- Reserved balance được refund đúng một lần.
- Rejection reason hiển thị trong Garage history.

## Bằng chứng DB

```sql
select contract_id, period_start, period_end, gross_charge_vnd,
       platform_fee_vnd, driver_net_vnd, status
from public.driver_earning_periods
where contract_id = '<CONTRACT_ID>';

select kind, partner_id, driver_id, amount_vnd, ref_type, ref_id
from public.ledger_entries
where ref_id in ('<EARNING_PERIOD_ID>', '<DRIVER_INVOICE_ID>')
order by id;

select invoice_number, amount_vnd, status, payout_id, paid_at
from public.driver_invoices
where id = '<DRIVER_INVOICE_ID>';

select withdrawal_number, amount_vnd, status, paid_at, failure_reason
from public.garage_withdrawals
where garage_id = '<GARAGE_USER_ID>'
order by requested_at desc;
```

## Danh sách việc cần làm

- [ ] S. Completed month và idempotent accrual đã verify
- [ ] T. Driver invoice đã verify
- [ ] U. Driver manual payout đã verify
- [ ] V. Garage withdrawal request đã verify
- [ ] W. Garage manual payout và refund đã verify

## Tiêu chí thành công

- Money rows atomic, idempotent, và khớp configured economics.
- Driver và Garage payouts cần admin approval và external transfer.
- Bank snapshots vẫn ổn định sau khi profile changes.

## Rủi ro

- Test-only date changes có thể ảnh hưởng các periods sau nếu không cleanup.
- External bank transfer không thể verify tự động trong app.

## Cân nhắc bảo mật

- Chỉ dùng test bank details.
- Xác nhận service-role money actions không thể được invoke bởi non-admin roles.

## Bước tiếp theo

Tiếp tục sang [Phase 5](./phase-05-regression-signoff.md).
