# UML Diagrams

Tài liệu UML chính hiện tại nằm ở:

- `docs/use-case-overview.md`: biểu đồ use case tổng quát theo demo.
- `docs/use-case-overview.drawio`: file use case tổng quát import trực tiếp vào draw.io.
- `docs/sequence-usecases.md`: bản đồ án tiếng Việt, gom use case theo actor.
- `docs/sequence-usecases.drawio`: file import trực tiếp vào draw.io.
- `docs/class-diagram.md`: biểu đồ lớp theo bảng CSDL và RPC/server action chính.
- `docs/class-diagram.drawio`: file biểu đồ lớp import trực tiếp vào draw.io.

## Scope Hiện Tại

| Actor chính    | Nhóm use case                                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Driver         | Đăng ký/đăng nhập, hồ sơ cá nhân, tài khoản nhận tiền, chọn garage, xác thực decal sau dán, gửi ảnh xác minh decal hằng tháng, thống kê thu nhập |
| Garage         | Đăng nhập, hồ sơ garage/thanh toán, lịch lắp decal, ảnh sau dán decal, thống kê nguồn thu                                                        |
| Partner        | Đăng ký/đăng nhập, hồ sơ doanh nghiệp, nạp tiền tự động, campaign, dashboard, thống kê chi phí                                                   |
| Platform/Admin | Dashboard hệ thống, duyệt ảnh decal sau dán, duyệt ảnh xác minh hằng tháng, hóa đơn/lợi nhuận, gán Driver, payout, settings, users/roles         |

## Ghi Chú

- Không dùng lại các sơ đồ cũ ngoài scope rút gọn.
- Biểu đồ use case tổng quát chỉ vẽ 4 actor nghiệp vụ chính: Driver, Garage, Partner, Platform/Admin.
- Các dịch vụ thanh toán và cơ chế nội bộ tạm thời không trình bày như actor UML; nếu cần thì mô tả như chi tiết triển khai trong kiến trúc/sequence.
- Khi cần sửa sequence UML, cập nhật `sequence-usecases.md` trước rồi sinh lại `sequence-usecases.drawio`.
- Khi cần trình bày đồ án ở mức tổng quan, dùng `use-case-overview.md` và `class-diagram.md` trước.
