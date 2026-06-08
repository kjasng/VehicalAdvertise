# Biểu Đồ Use Case Tổng Quát

## 1. Phạm Vi Sau Khi Scout

Biểu đồ này mô tả các use case tổng quát có trong demo hiện tại của VehicalAdvertise. Chỉ vẽ 4 actor nghiệp vụ chính:

- Driver
- Garage
- Partner
- Platform/Admin

Không vẽ actor phụ như ngân hàng, SePay, Supabase Auth, Supabase Storage, hệ thống lịch, audit log hoặc GPS tracking trong biểu đồ use case tổng quát. Các thành phần đó chỉ là chi tiết triển khai hoặc đã bị lược khỏi scope demo.

File import draw.io: `docs/use-case-overview.drawio`.

## 2. Kết Quả Scout Nhanh

| Actor          | Route/module chính                                                                                           | Kết luận use case                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Driver         | `src/app/driver/*`, `src/components/driver/*`, `src/lib/driver/*`                                            | Có dashboard, KYC/verify, profile, chọn garage, invoice/rút tiền                          |
| Garage         | `src/app/garage/*`, `src/components/garage/*`, `src/lib/garage/*`                                            | Có dashboard, lịch lắp decal, upload proof, profile/thanh toán, withdrawal                |
| Partner        | `src/app/partner/*`, `src/components/partner/*`, `src/lib/partner/*`                                         | Có onboarding doanh nghiệp, dashboard, billing/top-up, tạo campaign, invoice              |
| Platform/Admin | `src/app/admin/*`, `src/components/admin/*`, `src/lib/admin/*`                                               | Có dashboard, duyệt KYC/Partner/creative/install proof/photo check, payout, settings      |
| Auth chung     | `src/app/(public)/signup/*`, `src/app/(public)/login/*`, `src/app/onboarding/*`, `src/lib/auth/role-gate.ts` | Đăng nhập dùng chung 4 actor; đăng ký email/password áp dụng Driver và Partner tự đăng ký |

## 3. Actor Chính

| Actor          | Vai trò trong hệ thống                                                        |
| -------------- | ----------------------------------------------------------------------------- |
| Driver         | Người tham gia dán quảng cáo trên xe, chọn garage, theo dõi decal và thu nhập |
| Garage         | Đơn vị dán decal, upload ảnh proof và nhận tiền công lắp đặt                  |
| Partner        | Doanh nghiệp nạp tiền, tạo campaign và xem chi phí                            |
| Platform/Admin | Nhân sự vận hành duyệt hồ sơ, campaign, ảnh decal, payout, settings và users  |

## 4. Use Case Tổng Quát

### 4.1 Xác Thực Và Hồ Sơ Ban Đầu

| Mã UC  | Use case                         | Actor chính                             | Trạng thái scout |
| ------ | -------------------------------- | --------------------------------------- | ---------------- |
| AUTH01 | Đăng nhập                        | Driver, Garage, Partner, Platform/Admin | Có trong demo    |
| AUTH02 | Đăng ký email/password           | Driver, Partner                         | Có trong demo    |
| AUTH03 | Chọn vai trò và hoàn thiện hồ sơ | Driver, Partner                         | Có trong demo    |
| AUTH04 | Duyệt hồ sơ Driver/Partner       | Platform/Admin                          | Có trong demo    |

### 4.2 Driver

| Mã UC | Use case                                        | Trạng thái scout                                                                    |
| ----- | ----------------------------------------------- | ----------------------------------------------------------------------------------- |
| D01   | Gửi hồ sơ KYC Driver                            | Có trong demo                                                                       |
| D02   | Cập nhật hồ sơ và tài khoản nhận tiền           | Có trong demo                                                                       |
| D03   | Chọn garage dán decal                           | Có trong demo                                                                       |
| D04   | Theo dõi trạng thái decal/campaign              | Có trong demo                                                                       |
| D05   | Gửi ảnh xác minh decal hằng tháng               | Scope đã chốt, phía Admin có queue; phía Driver chưa thấy route/action submit riêng |
| D06   | Xem thu nhập và lập hóa đơn rút tiền hằng tháng | Có trong demo                                                                       |

### 4.3 Garage

| Mã UC | Use case                                      | Trạng thái scout |
| ----- | --------------------------------------------- | ---------------- |
| G01   | Cập nhật hồ sơ garage và tài khoản thanh toán | Có trong demo    |
| G02   | Xem lịch lắp decal                            | Có trong demo    |
| G03   | Đăng tải ảnh sau khi dán decal                | Có trong demo    |
| G04   | Xem nguồn thu và yêu cầu rút tiền             | Có trong demo    |

### 4.4 Partner

| Mã UC | Use case                          | Trạng thái scout |
| ----- | --------------------------------- | ---------------- |
| P01   | Gửi hồ sơ doanh nghiệp            | Có trong demo    |
| P02   | Nạp tiền tài khoản                | Có trong demo    |
| P03   | Tạo campaign và upload creative   | Có trong demo    |
| P04   | Xem dashboard campaign/số dư      | Có trong demo    |
| P05   | Xem hóa đơn và chi phí hằng tháng | Có trong demo    |

### 4.5 Platform/Admin

| Mã UC | Use case                                 | Trạng thái scout |
| ----- | ---------------------------------------- | ---------------- |
| A01   | Xem dashboard hệ thống                   | Có trong demo    |
| A02   | Duyệt hồ sơ Driver/Partner               | Có trong demo    |
| A03   | Duyệt creative/campaign                  | Có trong demo    |
| A04   | Gán Driver vào campaign                  | Có trong demo    |
| A05   | Duyệt ảnh decal sau khi dán              | Có trong demo    |
| A06   | Duyệt ảnh xác minh decal hằng tháng      | Có trong demo    |
| A07   | Xem hóa đơn và báo cáo lợi nhuận         | Có trong demo    |
| A08   | Quản lý payout/rút tiền Driver và Garage | Có trong demo    |
| A09   | Điều chỉnh thông số hệ thống             | Có trong demo    |
| A10   | Quản lý người dùng và phân quyền role    | Có trong demo    |

## 5. Phần Không Đưa Vào UC Tổng Quát

| Phần cũ hoặc chi tiết kỹ thuật         | Lý do không vẽ trong UC tổng quát                                        |
| -------------------------------------- | ------------------------------------------------------------------------ |
| GPS tracking / theo dõi hành trình     | Tracking table đã bị drop; chỉ còn một số field GPS phục vụ kiểm tra ảnh |
| Audit log                              | Migration đã drop audit log; không phải actor/use case nghiệp vụ         |
| SePay / ngân hàng                      | Chỉ là integration nạp tiền; không vẽ thành actor trong UC tổng quát     |
| Hệ thống lịch / scheduler              | Không thấy actor nghiệp vụ riêng trong demo hiện tại                     |
| Cập nhật thông tin xe như UC riêng     | Có dữ liệu xe trong hồ sơ/contract, nhưng không tách thành UC riêng      |
| Campaign hết gói                       | Là rule/trạng thái campaign, không phải use case riêng                   |
| Partner chỉnh sửa campaign trước duyệt | Chưa thấy route/action update campaign từ phía Partner trong codebase    |

## 6. Câu Hỏi Còn Mở

1. Driver gửi ảnh xác minh decal hằng tháng sẽ dùng route/action nào? Hiện scout thấy queue Admin đọc `periodic_vehicle`/`periodic_selfie`, nhưng chưa thấy màn Driver submit riêng.
2. Partner chỉnh sửa campaign trước duyệt có cần đưa vào demo không? Hiện codebase chỉ thấy tạo campaign, chưa thấy action sửa campaign từ phía Partner.
