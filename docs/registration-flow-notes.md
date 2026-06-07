# Registration Flow Notes (observed) — for sequence diagrams

Mô tả 2 luồng đăng ký quan sát trực tiếp khi test bằng Chrome (quay màn hình:
`recordings/driver-full-journey.mp4`, `recordings/partner-full-journey.mp4`).
Dùng làm input để dựng sequence diagram. Tên RPC/server action lấy theo code hiện
tại — **cần đối chiếu lại** khi vẽ (xem "Cần xác nhận" ở cuối).

## Luồng 1 — Đăng ký Driver

**Participants**

- Người dùng (User)
- Trình duyệt / Next.js UI
- Supabase Auth
- Trigger `handle_new_user`
- RPC `choose_role`
- Server action `submitKyc` (`src/app/driver/verify/actions.ts`)
- Supabase Storage (bucket `driver-kyc`)
- DB (`profiles`, `drivers`, `photos`)
- `proxy.ts` (cổng phân quyền)

**Trình tự**

1. User mở Landing `/` → bấm **Get Started** → điều hướng `/login`.
2. Bấm link **Sign up** → `/signup`.
3. Điền Full name, Email, Phone, Password + tick điều khoản → **Create Account**.
4. Trình duyệt gọi `supabase.auth.signUp(email, password, metadata{full_name, phone})`.
5. Supabase Auth tạo user (email confirmation TẮT → trả session ngay).
6. Trigger `handle_new_user` tạo `profiles` với `role = 'pending'`.
7. Có session → redirect `/onboarding`.
8. Đóng welcome dialog (**GOT IT**) → chọn **I DRIVE** → `chooseRoleAction` → RPC
   `choose_role('driver')` → `profiles.role = 'driver'` (+ tạo bản ghi `drivers`).
9. `proxy.ts`: role=driver nhưng chưa KYC → vào `/driver` và hiện **KYC wizard (3 bước)**.
10. **Bước 1 – Profile:** Họ tên, SĐT, Loại xe → Next.
11. **Bước 2 – CCCD:** upload ảnh mặt trước + mặt sau.
12. **Bước 3 – Selfie:** upload selfie → **Submit KYC**.
13. `submitKyc(FormData)`: upload 3 ảnh lên **Storage**, ghi `photos`, cập nhật `drivers`
    - `profiles.kyc_status = 'pending'`.
14. Trả thành công → toast "Hồ sơ đã được gửi. Phản hồi trong 24 giờ." → màn **chờ duyệt**.
15. _(Ngoài luồng)_ Admin duyệt KYC.

## Luồng 2 — Đăng ký Partner

**Participants**

- Người dùng (User)
- Trình duyệt / Next.js UI
- Supabase Auth
- Trigger `handle_new_user`
- RPC `choose_role`
- Server action gửi hồ sơ đối tác (partner onboarding)
- DB (`profiles`, `partners`)
- `proxy.ts`

**Trình tự**

1. Landing `/` → **Get Started** → `/login`.
2. **Sign up** → `/signup`.
3. Điền Full name, Email, Phone, Password + tick điều khoản → **Create Account**.
4. `supabase.auth.signUp(...)` → Auth tạo user (trả session ngay).
5. Trigger `handle_new_user` → `profiles.role = 'pending'`.
6. Redirect `/onboarding`.
7. Đóng welcome (**GOT IT**) → chọn **I ADVERTISE** → `chooseRoleAction` → RPC
   `choose_role('partner')` → `profiles.role = 'partner'` (+ tạo `partners` chưa duyệt).
8. `proxy.ts`: partner chưa duyệt → `/partner/dashboard` hiện form **ĐĂNG KÝ ĐỐI TÁC**.
9. Điền Tên công ty, MST, Địa chỉ, Người đại diện, SĐT → **Gửi hồ sơ**.
10. Server action cập nhật `partners` (company_name, tax_code, billing_address, contact...)
    - trạng thái **pending/submitted**.
11. UI chuyển sang **"ĐÃ GỬI HỒ SƠ"** → chờ admin duyệt.
12. _(Ngoài luồng)_ Admin duyệt → partner `approved` → mới được tạo campaign.

## Điểm chung

- Signup luôn là **email/password** qua Supabase Auth (OAuth Google là nhánh khác, không quay).
- `proxy.ts` là cổng điều hướng sau đăng nhập: `pending → /onboarding`; driver chưa KYC →
  KYC wizard; partner chưa duyệt → form đăng ký đối tác.
- Cả 2 luồng kết thúc ở trạng thái **chờ admin duyệt** (KYC / hồ sơ đối tác).

## Cần xác nhận (trước khi vẽ)

- Tên chính xác server action gửi hồ sơ đối tác (`src/app/partner/onboarding/` hoặc dashboard actions).
- `choose_role` tạo sẵn `drivers`/`partners` row hay tạo ở bước submit — kiểm tra migration RPC `choose_role`.
- Trạng thái cuối của `partners` sau "Gửi hồ sơ" (`pending` vs `submitted`).
  </content>
