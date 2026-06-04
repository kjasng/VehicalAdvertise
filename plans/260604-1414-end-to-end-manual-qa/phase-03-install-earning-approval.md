# Phase 3: Chọn garage, install, và duyệt earning

## Liên kết ngữ cảnh

- [Plan tổng quan](./plan.md)
- Driver garage selection: `src/app/driver/garage/`
- Garage install jobs: `src/app/garage/installs/`
- Garage proof upload: `src/app/garage/proof-upload/`
- Admin install review: `src/app/admin/install-proofs/`

## Tổng quan

Ưu tiên: Critical  
Trạng thái: Pending  
Mục tiêu: Kiểm tra earning gate từ lúc Driver chọn garage, Garage upload proof, đến khi Admin duyệt decal.

## O. Driver chọn garage

Đường dẫn: `/driver/dashboard`, `/driver/garage`

1. Xác nhận Driver dashboard hiển thị CTA rõ ràng để chọn garage.
2. Mở Garage Selection.
3. Kiểm tra chỉ approved garages được liệt kê.
4. Kiểm tra thông tin garage: name, address, phone, working hours, Google Maps link.
5. Chọn `QA Garage 260604`.
6. Thử chọn garage lần thứ hai.

Kết quả mong đợi:

- Contract chuyển từ `matched` sang `awaiting_install`.
- `install_garage_id` và `garage_selected_at` được set.
- Driver thấy installation instructions.
- Lần chọn thứ hai bị block.
- Driver vẫn chưa earning.

Optional suggestion check:

- Seed city/district của Driver khớp với garage address và xác nhận garage tương ứng được đánh dấu suggested.

## P. Garage upload install proof

Đường dẫn: `/garage/dashboard`, `/garage/installs`, `/garage/proof-upload`

1. Xác nhận selected Driver job xuất hiện trong Garage panel.
2. Thử submit ít hơn năm ảnh.
3. Thử một file không phải ảnh hoặc ảnh trên 6 MB.
4. Submit ảnh hợp lệ gồm front, rear, left, right, và close-up.
5. Thêm một note ngắn.

Kết quả mong đợi:

- Invalid uploads bị block.
- Valid upload tạo năm `install_proof` photo rows status pending.
- Contract chuyển sang `installed`.
- Garage job chuyển sang trạng thái waiting for admin review.
- Admin Install Proofs hiển thị các ảnh đã submit.

## Q. Admin review install proof

Đường dẫn: `/admin/install-proofs`

1. Mở cả năm ảnh và kiểm tra đúng Driver, Garage, và vehicle.
2. Duyệt ảnh đầu tiên.
3. Check contract status, `earning_start_date`, garage balance, và remaining photo statuses.
4. Duyệt các ảnh còn lại.
5. Kiểm tra garage credit không bị duplicate.

Hành vi sản phẩm mong đợi:

- Earning chỉ nên bắt đầu sau khi toàn bộ proof set được accept.
- Garage chỉ nên nhận đúng một install payout cho mỗi contract.

Kiểm tra defect dự kiến:

- Implementation hiện tại review từng photo riêng và có thể kích hoạt earning sau ảnh approved đầu tiên. Nếu xác nhận đúng, log High severity.

Nhánh rejection dùng một contract khác:

1. Reject một proof với reason.
2. Xác nhận Garage thấy reason.
3. Resubmit proof images.
4. Xác nhận stale pending rows được thay thế.

## R. Kiểm tra earning activation

Đường dẫn: `/driver/garage`, `/driver/invoice`, `/garage/payout`, `/partner/campaigns`

DB mong đợi:

- Contract status là `running`.
- `earning_start_date`, `earning_approved_at`, và `earning_approved_by` được set.
- Có đúng một row `garage_earnings` cho contract.
- Garage balance tăng một lần theo current install fee.
- Driver invoice page hiển thị active current period nhưng chưa cho tạo invoice trước khi đủ một tháng.

Kiểm tra defect dự kiến:

- Kiểm tra campaign status có chuyển sang `active` không. Nếu vẫn là `awaiting_install`, log status-sync gap.

## Bằng chứng DB

```sql
select id, status, install_garage_id, installed_at, earning_start_date,
       earning_approved_at, earning_approved_by
from public.contracts
where id = '<CONTRACT_ID>';

select subject_id, status, count(*)
from public.photos
where subject_id = '<CONTRACT_ID>'
  and kind = 'install_proof'
group by subject_id, status;

select contract_id, garage_id, amount_vnd, approved_at
from public.garage_earnings
where contract_id = '<CONTRACT_ID>';
```

## Danh sách việc cần làm

- [ ] O. Driver garage selection đã verify
- [ ] P. Garage proof upload đã verify
- [ ] Q. Admin proof review đã verify
- [ ] R. Earning activation đã verify

## Tiêu chí thành công

- Driver không thể earning trước khi install proof được admin approve.
- Garage chỉ nhận một install earning.
- State của Driver, Garage, Contract, và Campaign vẫn nhất quán.

## Rủi ro

- Per-photo approval có thể kích hoạt earning quá sớm.
- Manual Admin Contract status controls có thể tạo intermediate states gây khó hiểu.

## Cân nhắc bảo mật

- Garage không được upload proof cho contract của garage khác.
- Non-admin roles không được approve install proof.

## Bước tiếp theo

Tiếp tục sang [Phase 4](./phase-04-invoices-manual-payouts.md).
