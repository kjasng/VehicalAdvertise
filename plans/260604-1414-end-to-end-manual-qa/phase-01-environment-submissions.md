# Phase 1: Môi trường, fixtures, và nộp hồ sơ

## Liên kết ngữ cảnh

- [Plan tổng quan](./plan.md)
- [Scout report](./reports/scout-report.md)
- Partner nộp hồ sơ: `src/app/partner/onboarding/`
- Driver nộp hồ sơ: `src/app/driver/verify/`
- Admin approvals: `src/app/admin/partners-approval/`, `src/app/admin/drivers-kyc/`

## Tổng quan

Ưu tiên: Critical  
Trạng thái: Pending  
Mục tiêu: Chuẩn bị test data có thể lặp lại, sau đó kiểm tra flow Partner và Driver nộp hồ sơ/được duyệt mà không test authentication.

## Yêu cầu

- Dùng bốn browser profile hoặc session đã đăng nhập sẵn.
- Dùng QA users riêng, không dùng production users.
- Dùng ba ảnh KYC dưới 5 MB.
- Dùng garage fixture vì UI garage submit/approval chưa được implement.

## Dữ liệu test

| Entity | Giá trị đề xuất |
| --- | --- |
| Partner company | `QA Partner 260604` |
| Partner tax code | `0109999999` |
| Driver name | `QA Driver 260604` |
| Driver phone | Số điện thoại VN hợp lệ và unique |
| Driver body type | `sedan` |
| Garage name | `QA Garage 260604` |
| Garage service area | `Cầu Giấy, Hà Nội` |
| Driver bank | Tài khoản chỉ dùng để test, không dùng tiền thật |
| Garage bank | Tài khoản chỉ dùng để test, không dùng tiền thật |

## A. Chuẩn bị môi trường

1. Apply migrations:

   ```bash
   pnpm dlx supabase db push
   ```

2. Xác nhận `0021_manual_payout_review.sql` đã được apply.
3. Start app:

   ```bash
   pnpm dev
   ```

4. Mở các session Admin, Partner, Driver, và Garage đã đăng nhập sẵn.

Kết quả mong đợi:

- App load không có server error.
- `/admin/payouts` render được sau khi admin session sẵn sàng.
- Không step test nào yêu cầu login hoặc registration.

## B. Chuẩn bị fixtures

1. Ghi lại user IDs của Partner, Driver, Garage, và Admin.
2. Đảm bảo Partner và Driver đang ở trạng thái cho phép submission.
3. Chuẩn bị năm ảnh install dưới 6 MB cho các step sau.
4. Trong staging SQL Editor, chuẩn bị garage fixture vì chưa có UI garage onboarding/approval:

   ```sql
   update public.garages
   set shop_name = 'QA Garage 260604',
       address = 'Cau Giay, Ha Noi',
       contact_name = 'QA Garage Contact',
       phone = '0900000000',
       service_area = 'Cau Giay, Ha Noi',
       google_maps_url = 'https://maps.google.com/',
       working_hours = '08:00-18:00',
       approved = true
   where id = '<GARAGE_USER_ID>';
   ```

Kết quả mong đợi:

- Approved garage sẽ xuất hiện trong dữ liệu driver garage-selection ở các step sau.
- Garage dashboard không còn hiện Waiting Approval.

## C. Partner nộp profile

Đường dẫn: `/partner/onboarding`

1. Submit company name, tax code, address, contact name, và phone hợp lệ.
2. Refresh page.

UI mong đợi:

- Waiting screen báo profile đã được submit.
- Form không thể submit lặp lại khi status đang pending.

DB mong đợi:

- `partners.status = 'pending'`
- `partners.company_name`, `tax_code`, `billing_address` được update.
- `profiles.full_name`, `phone_e164` được update.

## D. Reject và nộp lại Partner

Đường dẫn: `/admin/partners-approval`

1. Reject Partner với reason ít nhất 5 ký tự.
2. Quay lại `/partner/onboarding`.
3. Kiểm tra rejection reason hiển thị.
4. Sửa một field và resubmit.

Kết quả mong đợi:

- Trạng thái chuyển thành `rejected`, sau đó quay lại `pending`.
- Rejection reason cũ được clear khi resubmit.
- Audit log có `partner_rejected`.

## E. Duyệt Partner

Đường dẫn: `/admin/partners-approval`

1. Duyệt Partner vừa resubmit.
2. Mở `/partner/dashboard`.

Kết quả mong đợi:

- `partners.status = 'approved'`
- Partner truy cập được dashboard, billing, và campaigns.
- Welcome guidance hiển thị cho Partner mới được approve.
- Audit log có `partner_approved`.

## F. Driver nộp KYC

Đường dẫn: `/driver/verify`

1. Nhập full name hợp lệ, số điện thoại VN unique, và body type `sedan`.
2. Upload ảnh CCCD mặt trước, CCCD mặt sau, và selfie dưới 5 MB.
3. Submit và refresh.

UI mong đợi:

- Waiting screen hiển thị sau khi submit và sau khi refresh.

DB mong đợi:

- `profiles.kyc_status = 'pending'`
- `drivers.body_type = 'sedan'`
- Có ba row `photos` pending với KYC kinds.

## G. Reject và nộp lại Driver

Đường dẫn: `/admin/drivers-kyc`

1. Reject Driver với một reason.
2. Quay lại `/driver/verify`.
3. Xác nhận trạng thái rejected hiển thị.
4. Resubmit bằng ảnh thay thế.

Kết quả mong đợi:

- Driver có thể resubmit sau khi bị reject.
- Stale KYC photo rows được thay thế, không duplicate vô hạn.
- Audit/review state phản ánh submission mới nhất.

## H. Duyệt Driver

Đường dẫn: `/admin/drivers-kyc`

1. Duyệt Driver.
2. Mở `/driver/dashboard`.

Kết quả mong đợi:

- `profiles.kyc_status = 'approved'`
- Driver truy cập được dashboard.
- Driver chưa có earning-active contract.

## I. Kiểm tra Garage fixture

Đường dẫn: `/garage/dashboard`, `/garage/payout`

1. Xác nhận garage đã approved.
2. Xác nhận chưa có install jobs hoặc earnings.
3. Chưa configure payout settings.

Kết quả mong đợi:

- Garage truy cập được install và payout pages.
- Available balance và lifetime earnings bằng zero.

## J. Kiểm tra gating ban đầu

1. Partner trước khi approval không thể tạo campaigns.
2. Driver trước khi KYC approval không thể tiến tới earning.
3. Driver không có contract sẽ không thấy campaign trên `/driver/garage`.
4. Garage trước khi approval không thể upload proof hoặc request withdrawal.

Kết quả mong đợi:

- Mỗi role bị block đúng business gate.

## Danh sách việc cần làm

- [ ] A. Môi trường sẵn sàng
- [ ] B. Fixtures đã được ghi lại
- [ ] C. Partner đã submit
- [ ] D. Partner rejection/resubmit đã verify
- [ ] E. Partner đã approved
- [ ] F. Driver KYC đã submit
- [ ] G. Driver rejection/resubmit đã verify
- [ ] H. Driver đã approved
- [ ] I. Garage fixture đã verify
- [ ] J. Initial gating đã verify

## Tiêu chí thành công

- Partner và Driver submissions có thể được review và resubmit.
- Garage fixture sẵn sàng cho install testing sau đó.
- Không role nào bypass được approval gate của mình.

## Rủi ro

- Garage approval cần setup DB thủ công.
- Dùng lại QA accounts cũ có thể để sót contracts, invoices, hoặc photos làm sai kết quả.

## Cân nhắc bảo mật

- KYC images phải là ảnh test không chứa dữ liệu nhạy cảm.
- Không expose signed KYC URLs ra ngoài test team.

## Bước tiếp theo

Tiếp tục sang [Phase 2](./phase-02-partner-campaign-contract.md).
