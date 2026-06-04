# Phase 2: Partner nạp tiền, campaign, và contract

## Liên kết ngữ cảnh

- [Plan tổng quan](./plan.md)
- Partner billing: `src/app/partner/billing/`
- Partner campaigns: `src/app/partner/campaigns/`
- Admin campaign review: `src/app/admin/creatives-review/`
- Admin contract matching: `src/app/admin/contracts/`

## Tổng quan

Ưu tiên: Critical  
Trạng thái: Pending  
Mục tiêu: Kiểm tra funding rules của Partner, validations khi publish campaign, admin review, funding configuration, và driver contract matching.

## Ghi chú quan trọng

- Partner QR hiện chưa tự credit money trong codebase.
- Partner Publish tạo DB status `submitted`.
- Một Driver với platform fee 20% cần gross monthly charge `1,375,000 VND` để driver net `1,100,000 VND`.

## K. Kiểm tra Partner top-up

Đường dẫn: `/partner/billing`

1. Nhập custom amount `9,999,999`.
2. Generate QR.
3. Chọn `10M` và generate QR.
4. Kiểm tra memo có Partner ID.
5. Dùng `/admin/partner-balances` để credit `10,000,000 VND`.

Kết quả mong đợi:

- Partner QR reject amount dưới 10m.
- QR 10m render đúng bank, account, memo, và exact amount.
- Admin credit tạo một ledger entry `partner_topup`.
- Partner balance, billing ledger, dashboard notification, và Partner Invoices được update.

Kiểm tra defect dự kiến:

- Thử admin manual top-up dưới 10m. Nếu được accept, log rằng credit path chưa enforce minimum deposit rule.

## L. Kiểm tra rules của campaign form

Đường dẫn: `/partner/campaigns`

Chạy các invalid submissions sau:

| Case | Input | Kết quả mong đợi |
| --- | --- | --- |
| Duration | Dưới 3 tháng | Block với minimum-duration error |
| Creative | Creative URL list rỗng | Block |
| Driver count | Zero | Block |
| Monthly cap | Dưới `driver count × 1,100,000` | Block |
| Balance | Dưới `driver count × 1,100,000 × 3` | Block |

Sau đó tạo một campaign hợp lệ:

| Field | Giá trị |
| --- | --- |
| Name | `QA Campaign 260604` |
| Duration | Ít nhất 3 tháng |
| Creative URLs | Ít nhất một public image URL hợp lệ |
| Driver count | `1` |
| Monthly cap | `1,500,000 VND` |
| QR target | HTTPS URL hợp lệ |

Kết quả mong đợi:

- Campaign hợp lệ được tạo một lần.
- DB status là `submitted`.
- `requested_driver_count = 1`
- `monthly_budget_vnd = 1,500,000`
- Partner dashboard hiển thị campaign và waiting-review notification.

Kiểm tra defect dự kiến:

- Set Admin Pricing Partner Minimum Cap cao hơn `1,500,000`, sau đó retry với cap nhỏ hơn. Nếu được accept, log rằng `partner_minimum_cap_vnd` chưa được enforce.

## M. Review campaign

Đường dẫn: `/admin/creatives-review`

1. Mở submitted campaign creative.
2. Reject một campaign test khác với reason và verify kết quả.
3. Approve `QA Campaign 260604`.

Kết quả mong đợi:

- Rejection bắt buộc có reason.
- Approved campaign chuyển thành `approved`.
- Approved campaign có thể dùng để contract matching.
- Audit/review fields được populate.

Ghi chú thuật ngữ:

- Partner UI gọi action là Publish, còn DB state hiện tại trước admin approval là `submitted`.

## N. Configure funding và match Driver

Đường dẫn: `/admin/campaigns`, `/admin/contracts`

1. Configure approved campaign:
   - Funding mode: monthly cap
   - Monthly budget: `1,500,000 VND`
   - Driver net monthly: `1,100,000 VND`
   - Platform fee: `20%`
   - Active driver limit: `1`
2. Kiểm tra invalid values bị block:
   - Driver net dưới 1m hoặc trên 1.2m
   - Monthly cap bằng zero
3. Trong Admin Contracts, chọn approved Driver.
4. Tạo vehicle nếu Driver chưa có.
5. Tạo contract mà không assign garage.

Kết quả mong đợi:

- Vehicle được approved và link với Driver.
- Contract được tạo với status `matched`.
- Campaign chuyển từ `approved` sang `awaiting_install`.
- Driver chưa earning.
- Duplicate contract cho cùng campaign và vehicle bị block.

Kiểm tra defect dự kiến:

- Kiểm tra matching hiện chưa enforce body type hoặc operating-area compatibility.
- Kiểm tra admin không cần assign garage; Driver phải tự chọn.

## Bằng chứng DB

```sql
select id, status, balance_vnd
from public.partners
where id = '<PARTNER_USER_ID>';

select id, name, status, monthly_budget_vnd, driver_net_monthly_vnd,
       platform_fee_pct, active_driver_limit, spent_vnd
from public.campaigns
where name = 'QA Campaign 260604';

select id, campaign_id, driver_id, vehicle_id, install_garage_id, status
from public.contracts
where campaign_id = '<CAMPAIGN_ID>';
```

## Danh sách việc cần làm

- [ ] K. Partner top-up đã verify
- [ ] L. Campaign validations đã verify
- [ ] M. Campaign review đã verify
- [ ] N. Funding và contract matching đã verify

## Tiêu chí thành công

- Partner không thể publish campaign thiếu tiền hoặc invalid.
- Approved campaign có thể match với approved Driver.
- Driver vẫn chưa earning sau khi contract được tạo.

## Rủi ro

- Automatic SePay credit chưa có; cần manual admin credit.
- Campaign funding checks tại publish time và earning time dùng calculation khác nhau khi platform fee khác zero.

## Cân nhắc bảo mật

- Chỉ dùng public test creative URLs.
- Kiểm tra non-admin roles không thể gọi campaign review hoặc funding actions.

## Bước tiếp theo

Tiếp tục sang [Phase 3](./phase-03-install-earning-approval.md).
