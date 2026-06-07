# Codebase Summary

**Overview:** VehicalAdvertise là ứng dụng Next.js 16 + TypeScript dùng Supabase Auth, Postgres và Storage. Scope hiện tại tập trung vào 4 nhóm actor: Driver, Garage, Partner, Platform/Admin. Luồng tiền gồm nạp tự động cho Partner và payout Driver/Garage do Admin duyệt, ghi nhận chuyển khoản thủ công.

## Scope Chính Hiện Tại

| Actor          | Chức năng chính                                                                                                                                                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Driver         | Đăng ký bằng email/password, đăng nhập, chọn vai trò và hoàn thiện hồ sơ ban đầu, gửi/cập nhật thông tin cá nhân, chờ Admin duyệt hồ sơ, tài khoản nhận tiền, chọn garage, xác thực decal sau dán, gửi ảnh xác minh decal hằng tháng, thống kê thu nhập |
| Garage         | Đăng nhập, cập nhật thông tin garage và thanh toán, xem lịch lắp decal, đăng ảnh sau khi dán decal, xem nguồn thu theo tháng                                                                                                                            |
| Partner        | Đăng ký bằng email/password, đăng nhập, chọn vai trò và hoàn thiện hồ sơ ban đầu, gửi thông tin doanh nghiệp, chờ Admin duyệt hồ sơ, nạp tiền tự động, tạo/chỉnh campaign, dashboard/chi phí                                                            |
| Platform/Admin | Đăng nhập, xem dashboard hệ thống, duyệt hồ sơ Driver/Partner, duyệt ảnh decal sau dán, duyệt ảnh xác minh decal hằng tháng, xem hóa đơn/lợi nhuận, gán Driver vào campaign, quản lý rút tiền, chỉnh thông số hệ thống, users/roles                     |

## Phần Đã Lược Khỏi Summary

| Phần cũ                               | Trạng thái trình bày                               |
| ------------------------------------- | -------------------------------------------------- |
| Theo dõi vị trí hành trình            | Không mô tả như use case chính                     |
| Ảnh kiểm tra theo lịch kiểu cũ        | Thay bằng Driver gửi ảnh xác minh decal hằng tháng |
| Cập nhật thông tin xe như UC riêng    | Không có thao tác demo rõ                          |
| Campaign hết gói như UC riêng         | Chỉ là rule/trạng thái của campaign                |
| Nhật ký kỹ thuật                      | Không đưa thành actor/lifeline                     |
| Biểu đồ km/route/attribution chi tiết | Không đưa vào dashboard scope mới                  |
| Các mở rộng hậu kỳ khác               | Ngoài scope summary hiện tại                       |

## App Routes Theo Actor

| Route                          | Purpose                                                                                                                |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `/driver`                      | Driver workspace: dashboard thu nhập, chọn garage, hóa đơn/rút tiền, hồ sơ cá nhân/xe/tài khoản nhận tiền              |
| `/garage`                      | Garage workspace: dashboard nguồn thu, lịch lắp decal, upload proof sau dán decal, hồ sơ garage/thanh toán             |
| `/partner`                     | Partner workspace: hồ sơ doanh nghiệp, nạp tiền, tạo campaign, dashboard, hóa đơn/chi phí                              |
| `/admin`                       | Platform/Admin workspace: dashboard hệ thống, campaign/contract, xác thực decal, hóa đơn, payout, pricing, users/roles |
| `/onboarding`                  | Chọn vai trò và hoàn thiện thông tin ban đầu sau đăng ký                                                               |
| `/api/v1/webhooks/sepay`       | Webhook nạp tiền tự động cho Partner                                                                                   |
| `/api/v1/admin/reports/[type]` | Export báo cáo tháng cho Admin                                                                                         |

## Workflow Theo Actor

### Driver

- Đăng ký bằng email/password qua Supabase Auth, sau đó vào trang chọn vai trò Driver và hoàn thiện hồ sơ ban đầu.
- Gửi/cập nhật thông tin cá nhân trong `profiles` và `drivers`.
- Sau đăng ký, hồ sơ Driver cần Platform/Admin duyệt trước khi vào luồng vận hành chính.
- Cập nhật tài khoản nhận tiền để đủ điều kiện tạo yêu cầu rút.
- Chọn garage đã được duyệt cho contract đang chờ lắp.
- Theo dõi trạng thái xác thực decal sau khi Garage upload proof và Admin duyệt.
- Gửi ảnh xác minh decal định kỳ hằng tháng để Platform/Admin duyệt.
- Xem thu nhập, hóa đơn và trạng thái payout.

### Garage

- Đăng nhập qua Supabase Auth.
- Cập nhật tên garage, địa chỉ, Google Maps, thông tin liên hệ và tài khoản thanh toán.
- Xem lịch/job lắp decal được Driver chọn hoặc Admin gán.
- Upload ảnh proof sau khi dán decal.
- Xem nguồn thu theo tháng và trạng thái withdrawal.

### Partner

- Đăng ký bằng email/password qua Supabase Auth, sau đó vào trang chọn vai trò Partner và hoàn thiện hồ sơ ban đầu.
- Gửi thông tin doanh nghiệp: tên công ty, mã số thuế, địa chỉ, liên hệ.
- Sau đăng ký, hồ sơ doanh nghiệp cần Platform/Admin duyệt trước khi tạo campaign.
- Nạp tiền tự động; webhook/cơ chế xác nhận giao dịch cộng balance và ghi ledger.
- Tạo campaign với creative, thời gian, số Driver, monthly cap và budget reserve.
- Chỉnh sửa campaign trước khi Admin duyệt: thuộc scope nghiệp vụ, cần action/rule rõ nếu triển khai đầy đủ.
- Campaign hết gói chỉ mô tả như rule/trạng thái của campaign, không đưa thành use case riêng.
- Xem dashboard: số tiền hiện tại, tổng campaign, tổng Driver, monthly budget usage, danh sách campaign.
- Xem thống kê chi phí tháng: tiền Driver, công Garage, chi phí khác.

### Platform/Admin

- Đăng nhập qua Supabase Auth.
- Xem dashboard hệ thống: active drivers, campaigns, doanh thu, lợi nhuận.
- Duyệt hoặc từ chối hồ sơ Driver/Partner sau đăng ký.
- Duyệt ảnh decal sau dán từ proof Garage upload.
- Duyệt ảnh xác minh decal hằng tháng do Driver gửi.
- Xem hóa đơn Driver, Partner, Garage và báo cáo lợi nhuận.
- Gán Driver/xe/Garage vào campaign để tạo contract.
- Quản lý rút tiền Driver/Garage: duyệt, từ chối, đánh dấu đã chuyển khoản.
- Điều chỉnh thông số hệ thống: giá dán decal, số tiền rút tối thiểu, số tiền nạp tối thiểu, phí dịch vụ.
- Quản lý người dùng và phân quyền role.

## Actor Phụ

| Actor phụ             | Vai trò                                                 |
| --------------------- | ------------------------------------------------------- |
| Supabase Auth         | Xác thực đăng ký/đăng nhập                              |
| Supabase Database/RPC | Lưu hồ sơ, campaign, contract, invoice, ledger, setting |
| Supabase Storage      | Lưu ảnh creative và proof decal                         |
| Dịch vụ email         | Thông báo kết quả duyệt khi cấu hình gửi email bật      |

Ghi chú: các dịch vụ thanh toán và cơ chế nội bộ tạm thời không trình bày như actor trong tài liệu UML/summary. Khi cần mô tả triển khai, đưa vào phần kiến trúc hoặc integration detail.

## Shared UI And Data Modules

| Area         | Main files                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Shared shell | `src/components/shared/role-shell.tsx`, `role-sidebar.tsx`, `role-bottom-nav.tsx`, `role-topbar.tsx`, `role-user-menu.tsx` |
| Driver       | `src/app/driver/*`, `src/components/driver/*`, `src/lib/driver/*`                                                          |
| Garage       | `src/app/garage/*`, `src/components/garage/*`, `src/lib/garage/*`                                                          |
| Partner      | `src/app/partner/*`, `src/components/partner/*`, `src/lib/partner/*`                                                       |
| Admin        | `src/app/admin/*`, `src/components/admin/*`, `src/lib/admin/*`                                                             |
| Auth/gating  | `src/lib/auth/role-gate.ts`, `src/proxy.ts`                                                                                |
| Supabase     | `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`, `supabase/migrations/*`                                         |

## Unresolved Questions

1. Partner chỉnh sửa campaign trước duyệt sẽ dùng server action nào và giới hạn sửa theo status nào?
2. Ảnh xác minh decal hằng tháng sẽ dùng bảng/request/status nào khi triển khai đầy đủ?
