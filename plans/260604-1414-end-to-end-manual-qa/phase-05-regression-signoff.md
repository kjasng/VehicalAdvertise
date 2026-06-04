# Phase 5: Admin regression, edge cases, và sign-off

## Liên kết ngữ cảnh

- [Plan tổng quan](./plan.md)
- [Scout report](./reports/scout-report.md)
- Admin invoices: `src/app/admin/invoices/`
- Ledger adjustments: `src/app/admin/ledger-adjustments/`
- Audit log: `src/app/admin/audit-log/`

## Tổng quan

Ưu tiên: High  
Trạng thái: Pending  
Mục tiêu: Xác nhận admin operational tooling, money separation, concurrency safety, và release readiness.

## X. Quét regression admin

### Invoices

1. Mở Driver, Partner, và Garage Invoices.
2. Xác nhận mỗi page chỉ chứa đúng document type của nó.
3. Xác nhận old Kind filter đã không còn.
4. Print Driver và Garage HTML invoices.

Kết quả mong đợi:

- Driver invoices chỉ hiển thị withdrawal requests do Driver tạo.
- Partner invoices chỉ hiển thị partner top-up/charge records.
- Garage invoices chỉ hiển thị Garage withdrawal requests.

### Filters và tools

1. Contracts: test contract-type, status, và user search filters.
2. Payouts: test name, email, phone, bank account, month, và quarter filters.
3. Users: test refresh action.
4. Pricing Settings: kiểm tra grouped Garage, Partner, và Driver fields.
5. Xác nhận `SEPAY EVENTS — LAST 50` đã không còn.

### Ledger Adjustments

1. Tạo Partner adjustment/refund.
2. Tạo Driver adjustment/refund.
3. Xác nhận balances và payout availability update.
4. Xác nhận adjustment không tạo Driver, Partner, hoặc Garage withdrawal invoice.

### Audit Log

Kiểm tra có entries cho:

- Partner approve/reject
- Partner top-up
- Contract creation
- Install proof review
- Driver withdrawal approval/paid
- Garage withdrawal request/approve/paid/reject
- Ledger adjustment/refund

## Y. Negative cases, concurrency, và authorization

| Nhóm | Case | Kết quả mong đợi |
| --- | --- | --- |
| Retry | Double-click Partner top-up | Không tạo duplicate credit ngoài ý muốn |
| Retry | Hai admin approve cùng Driver invoice | Chỉ có một payout và một ledger debit |
| Retry | Hai admin approve/reject cùng Garage request | Chỉ có một final transition |
| Balance | Driver request vượt available balance | Approval bị block |
| Balance | Garage request vượt available balance | Request bị block |
| State | Driver tạo invoice trước completed period | Bị block |
| State | Garage upload proof cho contract của garage khác | Bị block |
| State | Admin approve proof đã reviewed | Bị block |
| Authorization | Partner/Driver/Garage invoke admin action | Forbidden |
| Snapshot | User đổi bank sau request | Admin vẫn thấy original snapshot |
| Integrity | Approve thêm install proof | Không duplicate garage earning |
| Integrity | Refresh Driver invoice page liên tục | Không duplicate earning period |

Xác nhận defect dự kiến:

- Thiếu UI garage onboarding/approval.
- Admin manual top-up dưới 10m có thể được accept.
- Partner minimum cap có thể chưa được enforce.
- Contract matching có thể ignore body type và area.
- Approve install photo đầu tiên có thể kích hoạt earning.
- Campaign có thể vẫn `awaiting_install` sau khi Driver earning activation.
- Thiếu Driver payout rejection action.
- Driver bank verification có thể chưa bắt buộc.
- Monthly earning có thể không accrue cho đến khi Driver invoice page được load.

## Z. Cleanup và sign-off

1. Restore Pricing Settings về intended values.
2. Remove hoặc archive QA campaigns, contracts, photos, invoices, payouts, và test users trong staging.
3. Restore các thay đổi `earning_start_date` chỉ dùng cho test.
4. Lưu screenshots và DB query results kèm entity IDs.
5. Tạo defect tickets cho mọi expected behavior bị fail.
6. Chạy release checks:

   ```bash
   pnpm lint
   pnpm build
   pnpm dlx supabase db push --dry-run
   ```

## Mẫu defect

| Trường | Nội dung bắt buộc |
| --- | --- |
| Title | Role + route + behavior bị fail |
| Severity | Critical / High / Medium / Low |
| Preconditions | IDs, statuses, pricing values |
| Steps | Chuỗi bước reproduce tối thiểu |
| Expected | Product rule |
| Actual | UI và DB state quan sát được |
| Evidence | Screenshot, query result, timestamp |
| Data impact | Ảnh hưởng đến balance, ledger, invoice, hoặc status |

## Danh sách việc cần làm

- [ ] X. Admin regression sweep hoàn tất
- [ ] Y. Negative/concurrency/authorization cases hoàn tất
- [ ] Z. Cleanup và release sign-off hoàn tất

## Tiêu chí thành công

- Tất cả admin operational views nhất quán với source-of-truth tables.
- Không thể tạo duplicate credit, debit, earning, invoice, hoặc payout.
- Tất cả known gaps có documented decision hoặc defect ticket.

## Rủi ro

- Manual cleanup có thể xóa mất defect evidence hữu ích; capture evidence trước.
- Testing concurrency cần hai admin tabs hoặc sessions.

## Cân nhắc bảo mật

- Không đưa PII hoặc bank details vào screenshots chia sẻ ngoài test team.
- Xác nhận blocked/non-admin users không thể invoke privileged money actions.

## Bước tiếp theo

Ưu tiên fix Critical và High defects trước production pilot testing.
