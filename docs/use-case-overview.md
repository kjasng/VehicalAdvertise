# Biểu Đồ Use Case Tổng Quát

## 1. Phạm Vi Demo

Biểu đồ này mô tả các actor và use case có trong demo hiện tại của VehicalAdvertise. Scope chỉ giữ các chức năng đã chốt cho Driver, Garage, Partner và Platform/Admin.

## 2. Làm Rõ Thuật Ngữ

Trong tài liệu cũ, `onboarding` nghĩa là bước sau khi người dùng đăng ký email/password: chọn vai trò, điền hồ sơ ban đầu theo vai trò đó, submit và chờ Platform/Admin duyệt. Để tránh lẫn với đăng nhập, tài liệu này dùng cụm tiếng Việt: **hoàn thiện hồ sơ ban đầu**.

Ví dụ:

- Driver đăng ký tài khoản, chọn vai trò Driver, hoàn thiện hồ sơ cá nhân/xe/tài khoản nhận tiền, chờ Admin duyệt.
- Partner đăng ký tài khoản, chọn vai trò Partner, hoàn thiện hồ sơ doanh nghiệp, chờ Admin duyệt.

## 3. Actor

| Actor          | Vai trò                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------- |
| Driver         | Người đăng ký tham gia dán quảng cáo trên xe, chọn garage, theo dõi xác thực decal và thu nhập |
| Garage         | Đơn vị dán decal, quản lý lịch lắp, upload ảnh proof và theo dõi nguồn thu                     |
| Partner        | Doanh nghiệp nạp tiền, tạo campaign và xem dashboard/chi phí                                   |
| Platform/Admin | Nhân sự vận hành duyệt hồ sơ, campaign, proof decal, payout, settings và users/roles           |

Ghi chú: các thành phần kỹ thuật/thanh toán không vẽ như actor trong biểu đồ use case tổng quát này. Nếu cần mô tả chi tiết triển khai, đặt chúng trong sequence diagram hoặc phần kiến trúc.

## 4. Danh Sách Use Case

### 4.1 Xác Thực Chung

| Mã UC  | Use case                              | Actor áp dụng                           |
| ------ | ------------------------------------- | --------------------------------------- |
| AUTH01 | Đăng nhập                             | Driver, Garage, Partner, Platform/Admin |
| AUTH02 | Đăng ký email/password                | Driver, Partner                         |
| AUTH03 | Hoàn thiện hồ sơ Driver ban đầu       | Driver, Platform/Admin duyệt hồ sơ      |
| AUTH04 | Hoàn thiện hồ sơ doanh nghiệp Partner | Partner, Platform/Admin duyệt hồ sơ     |

### 4.2 Driver

| Mã UC | Use case                          |
| ----- | --------------------------------- |
| D01   | Cập nhật thông tin cá nhân        |
| D02   | Cập nhật tài khoản nhận tiền      |
| D03   | Chọn garage dán decal             |
| D04   | Theo dõi xác thực decal sau dán   |
| D05   | Gửi ảnh xác minh decal hằng tháng |
| D06   | Xem thống kê thu nhập             |

### 4.3 Garage

| Mã UC | Use case                                |
| ----- | --------------------------------------- |
| G01   | Cập nhật thông tin garage và thanh toán |
| G02   | Xem lịch lắp decal                      |
| G03   | Đăng tải hình ảnh sau khi dán decal     |
| G04   | Xem thống kê nguồn thu theo tháng       |
| G05   | Yêu cầu rút tiền                        |

### 4.4 Partner

| Mã UC | Use case                                |
| ----- | --------------------------------------- |
| P01   | Cập nhật thông tin doanh nghiệp         |
| P02   | Nạp tiền tự động                        |
| P03   | Tạo campaign                            |
| P04   | Chỉnh sửa campaign trước khi được duyệt |
| P05   | Xem dashboard thống kê                  |
| P06   | Xem thống kê chi phí hằng tháng         |

### 4.5 Platform/Admin

| Mã UC | Use case                                  |
| ----- | ----------------------------------------- |
| A01   | Xem dashboard hệ thống                    |
| A02   | Duyệt hồ sơ Driver và Partner sau đăng ký |
| A03   | Duyệt ảnh decal sau khi dán               |
| A04   | Duyệt ảnh xác minh decal hằng tháng       |
| A05   | Xem hóa đơn                               |
| A06   | Xem thống kê lợi nhuận                    |
| A07   | Gán Driver vào campaign                   |
| A08   | Quản lý rút tiền cho Driver và Garage     |
| A09   | Điều chỉnh thông số hệ thống              |
| A10   | Quản lý người dùng và phân quyền role     |
