# Đồ Án: Biểu Đồ Trình Tự Các Ca Sử Dụng

## 1. Mục Tiêu

Tài liệu này viết lại các sequence diagram theo scope rút gọn mới của dự án VehicalAdvertise. Cách trình bày chính: gom use case theo actor nghiệp vụ, chỉ rõ actor chính, actor phụ, và loại khỏi sơ đồ những phần không còn nằm trong danh sách chức năng bạn cung cấp.

File import draw.io: `docs/sequence-usecases.drawio`.

## 2. Kết Quả Rà Soát Scope

### 2.1 Giữ lại trong đồ án

| Nhóm           | Phần giữ lại                                                                                                                                                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Driver         | Đăng ký email/password, đăng nhập, chọn vai trò và hoàn thiện hồ sơ ban đầu, gửi/cập nhật thông tin cá nhân, chờ Admin duyệt hồ sơ, tài khoản nhận tiền, chọn garage, xác thực decal sau dán, gửi ảnh xác minh decal hằng tháng, thu nhập |
| Garage         | Đăng nhập, cập nhật thông tin garage/thanh toán, xem lịch lắp decal, đăng ảnh sau dán decal, xem nguồn thu theo tháng                                                                                                                     |
| Partner        | Đăng ký email/password, đăng nhập, chọn vai trò và hoàn thiện hồ sơ ban đầu, gửi thông tin doanh nghiệp, chờ Admin duyệt hồ sơ, nạp tiền tự động, tạo/chỉnh campaign, dashboard/chi phí                                                   |
| Platform/Admin | Đăng nhập, dashboard hệ thống, duyệt hồ sơ Driver/Partner, duyệt ảnh decal sau dán, duyệt ảnh xác minh decal hằng tháng, hóa đơn, lợi nhuận, gán driver vào campaign, rút tiền driver/garage, thông số hệ thống, người dùng và role       |

### 2.2 Loại khỏi sequence và summary

| Phần cũ                               | Lý do loại                                                                    |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| Theo dõi vị trí hành trình            | Không còn trong scope mới; code hiện chỉ còn dấu vết/stub hoặc dữ liệu nền cũ |
| Duyệt ảnh kiểm tra theo lịch kiểu cũ  | Đã thay bằng Driver chủ động gửi ảnh xác minh decal hằng tháng                |
| Cập nhật thông tin xe như UC riêng    | Không có thao tác demo rõ; không đưa thành use case độc lập                   |
| Campaign hết gói như UC riêng         | Là rule/trạng thái của campaign; không phải mục tiêu riêng của actor          |
| Nhật ký kỹ thuật như một lifeline     | Là chi tiết triển khai nội bộ, không phải tác nhân nghiệp vụ                  |
| Biểu đồ km/route/attribution chi tiết | Không nằm trong dashboard mới bạn mô tả                                       |
| Các mở rộng hậu kỳ khác               | Ngoài scope đồ án hiện tại                                                    |

### 2.3 Điểm lệch giữa scope mới và source hiện tại

| Yêu cầu trong scope mới                    | Tình trạng khi rà source                                                                   | Cách trình bày trong đồ án                                                |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Partner chỉnh sửa campaign trước khi duyệt | Chưa thấy server action update campaign riêng trong `src/app/partner/campaigns/actions.ts` | Vẽ là nhánh nghiệp vụ cần bổ sung trước bước admin duyệt                  |
| Request xác thực decal                     | Source thực tế là garage upload 4 ảnh proof sau dán decal và admin duyệt proof             | Vẽ chính xác theo luồng Garage upload, Admin duyệt, Driver xem trạng thái |
| Ảnh xác minh decal hằng tháng              | User vừa bổ sung cơ chế Driver gửi ảnh mỗi tháng                                           | Vẽ thành use case Driver gửi ảnh và Platform/Admin duyệt                  |

## 3. Actor Chính Và Actor Phụ

### 3.1 Actor chính

| Actor          | Vai trò trong đồ án                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Driver         | Người đăng ký xe, cập nhật hồ sơ, chọn garage, gửi ảnh xác minh decal hằng tháng, xem thu nhập                                  |
| Garage         | Đơn vị dán decal, cập nhật thông tin garage, xem lịch lắp, upload ảnh proof, xem nguồn thu                                      |
| Partner        | Doanh nghiệp nạp tiền, tạo campaign, theo dõi dashboard và chi phí                                                              |
| Platform/Admin | Nhân sự vận hành hệ thống, duyệt decal sau dán, duyệt ảnh xác minh hằng tháng, gán driver, xử lý payout, chỉnh thông số và role |

### 3.2 Actor phụ

| Actor phụ             | Mục đích                                                             |
| --------------------- | -------------------------------------------------------------------- |
| Supabase Auth         | Xác thực đăng ký/đăng nhập                                           |
| Supabase Database/RPC | Lưu dữ liệu, kiểm tra trạng thái, xử lý nghiệp vụ tiền và trạng thái |
| Supabase Storage      | Lưu ảnh KYC/creative/proof decal khi có upload                       |
| Dịch vụ email         | Gửi thông báo kết quả duyệt khi cần                                  |

Ghi chú: các dịch vụ thanh toán và cơ chế nội bộ tạm thời không trình bày như actor trong bộ UML này. Nếu cần, mô tả chúng như chi tiết triển khai nội bộ ở phần kiến trúc.

## 4. Danh Sách Use Case Theo Actor

### 4.1 Xác thực chung

| Mã UC     | Tên use case                          | Actor chính                         | Actor phụ                             |
| --------- | ------------------------------------- | ----------------------------------- | ------------------------------------- |
| UC-AUTH01 | Đăng nhập                             | Driver/Garage/Partner/PlatformAdmin | Supabase Auth, Supabase Database/RPC  |
| UC-AUTH02 | Đăng ký email/password                | Driver/Partner                      | Supabase Auth, Supabase Database/RPC  |
| UC-AUTH03 | Hoàn thiện hồ sơ Driver ban đầu       | Driver                              | Supabase Database/RPC, Platform/Admin |
| UC-AUTH04 | Hoàn thiện hồ sơ doanh nghiệp Partner | Partner                             | Supabase Database/RPC, Platform/Admin |

### 4.2 Driver

| Mã UC  | Tên use case                      | Actor chính | Actor phụ                                               |
| ------ | --------------------------------- | ----------- | ------------------------------------------------------- |
| UC-D01 | Gửi và cập nhật thông tin cá nhân | Driver      | Supabase Database/RPC                                   |
| UC-D02 | Cập nhật tài khoản nhận tiền      | Driver      | Supabase Database/RPC                                   |
| UC-D03 | Chọn garage dán decal             | Driver      | Garage, Supabase Database/RPC                           |
| UC-D04 | Theo dõi xác thực decal sau dán   | Driver      | Garage, Platform/Admin, Supabase Storage                |
| UC-D05 | Gửi ảnh xác minh decal hằng tháng | Driver      | Supabase Storage, Supabase Database/RPC, Platform/Admin |
| UC-D06 | Xem thống kê thu nhập             | Driver      | Supabase Database/RPC                                   |

### 4.3 Garage

| Mã UC  | Tên use case                            | Actor chính | Actor phụ                             |
| ------ | --------------------------------------- | ----------- | ------------------------------------- |
| UC-G01 | Cập nhật thông tin garage và thanh toán | Garage      | Supabase Database/RPC                 |
| UC-G02 | Xem lịch lắp decal                      | Garage      | Supabase Database/RPC                 |
| UC-G03 | Đăng tải hình ảnh sau khi dán decal     | Garage      | Supabase Storage, Platform/Admin      |
| UC-G04 | Xem thống kê nguồn thu theo tháng       | Garage      | Supabase Database/RPC                 |
| UC-G05 | Yêu cầu rút tiền                        | Garage      | Supabase Database/RPC, Platform/Admin |

### 4.4 Partner

| Mã UC  | Tên use case                            | Actor chính | Actor phụ                                               |
| ------ | --------------------------------------- | ----------- | ------------------------------------------------------- |
| UC-P01 | Gửi thông tin doanh nghiệp              | Partner     | Supabase Database/RPC, Platform/Admin                   |
| UC-P02 | Nạp tiền tự động                        | Partner     | Supabase Database/RPC                                   |
| UC-P03 | Tạo campaign                            | Partner     | Supabase Storage, Supabase Database/RPC, Platform/Admin |
| UC-P04 | Chỉnh sửa campaign trước khi được duyệt | Partner     | Supabase Database/RPC                                   |
| UC-P05 | Xem dashboard thống kê                  | Partner     | Supabase Database/RPC                                   |
| UC-P06 | Xem thống kê chi phí hằng tháng         | Partner     | Supabase Database/RPC                                   |

### 4.5 Platform/Admin

| Mã UC  | Tên use case                              | Actor chính    | Actor phụ                            |
| ------ | ----------------------------------------- | -------------- | ------------------------------------ |
| UC-A01 | Xem dashboard hệ thống                    | Platform/Admin | Supabase Database/RPC                |
| UC-A02 | Duyệt hồ sơ Driver và Partner sau đăng ký | Platform/Admin | Driver, Partner, Supabase Storage    |
| UC-A03 | Duyệt ảnh decal sau khi dán               | Platform/Admin | Garage, Driver, Supabase Storage     |
| UC-A04 | Duyệt ảnh xác minh decal hằng tháng       | Platform/Admin | Driver, Supabase Storage             |
| UC-A05 | Xem hóa đơn                               | Platform/Admin | Supabase Database/RPC                |
| UC-A06 | Xem thống kê lợi nhuận                    | Platform/Admin | Supabase Database/RPC                |
| UC-A07 | Gán driver vào campaign                   | Platform/Admin | Driver, Partner, Garage              |
| UC-A08 | Quản lý rút tiền cho driver và garage     | Platform/Admin | Driver, Garage                       |
| UC-A09 | Điều chỉnh thông số hệ thống              | Platform/Admin | Supabase Database/RPC                |
| UC-A10 | Quản lý người dùng và phân quyền role     | Platform/Admin | Supabase Auth, Supabase Database/RPC |

## 5. Sequence Diagram

### 1. Đăng nhập chung

**Actor chính:** Driver, Garage, Partner hoặc Platform/Admin.

**Mục tiêu:** Mô tả luồng đăng nhập chung cho tất cả actor, sau đó điều hướng tới workspace theo role.

```mermaid
sequenceDiagram
    title Đăng nhập chung
    actor User as Driver/Garage/Partner/Admin
    participant Web as Giao diện đăng nhập
    participant Auth as Supabase Auth
    participant DB as Supabase Database
    User->>Web: Mở màn hình đăng nhập
    Web->>Auth: Gửi email/password
    Auth->>DB: Xác nhận tài khoản và role hiện tại
    DB->>Web: Trả về role hiện tại của người dùng
    Web->>User: Điều hướng tới workspace theo role
```

### 2. Đăng ký email/password và hoàn thiện hồ sơ Driver/Partner

**Actor chính:** Driver hoặc Partner.

**Mục tiêu:** Tách riêng đăng ký khỏi đăng nhập. Driver và Partner đăng ký bằng email/password, vào trang chọn vai trò, hoàn thiện hồ sơ ban đầu theo role, submit và chờ Platform/Admin duyệt.

```mermaid
sequenceDiagram
    title Đăng ký email/password và hoàn thiện hồ sơ Driver/Partner
    actor NewUser as Driver/Partner
    participant Register as Trang đăng ký
    participant Auth as Supabase Auth
    participant RolePage as Trang chọn vai trò
    participant ProfileForm as Form hồ sơ cá nhân/doanh nghiệp
    participant DB as Supabase Database
    actor Admin as Platform/Admin
    NewUser->>Register: Nhập email và password
    Register->>Auth: Đăng ký tài khoản bằng email/password
    Auth->>DB: Tạo tài khoản và profile ban đầu
    Register->>RolePage: Chuyển sang trang chọn vai trò
    NewUser->>RolePage: Chọn role Driver hoặc Partner
    RolePage->>DB: Lưu role đã chọn
    RolePage->>ProfileForm: Hiển thị form theo role
    NewUser->>ProfileForm: Điền thông tin cá nhân hoặc doanh nghiệp
    ProfileForm->>DB: Submit hồ sơ chờ duyệt
    Admin->>DB: Mở hàng đợi hồ sơ Driver chờ duyệt
    Admin->>DB: Duyệt hoặc từ chối hồ sơ Driver
    Admin->>DB: Mở hàng đợi hồ sơ Partner chờ duyệt
    Admin->>DB: Duyệt hoặc từ chối hồ sơ Partner
    DB->>ProfileForm: Cập nhật trạng thái approved/rejected/pending
    ProfileForm->>NewUser: Hiển thị kết quả duyệt hoặc bước tiếp theo
```

### 3. Driver gửi và cập nhật hồ sơ

**Actor chính:** Driver.

**Mục tiêu:** Driver gửi/cập nhật thông tin cá nhân và tài khoản nhận tiền.

```mermaid
sequenceDiagram
    title Driver gửi và cập nhật hồ sơ
    actor Driver as Driver
    participant DriverUI as Giao diện Driver
    participant Action as Server action hồ sơ Driver
    participant DB as Supabase Database
    actor Admin as Platform/Admin
    Driver->>DriverUI: Nhập thông tin cá nhân
    Driver->>DriverUI: Nhập tài khoản nhận tiền
    DriverUI->>Action: Gửi dữ liệu hồ sơ
    Action->>DB: Kiểm tra dữ liệu và cập nhật profiles/drivers
    DB->>DriverUI: Trả trạng thái lưu thành công
    Admin->>DB: Duyệt hoặc từ chối hồ sơ Driver khi cần
    DriverUI->>Driver: Hiển thị hồ sơ mới nhất
```

### 4. Driver chọn garage dán decal

**Actor chính:** Driver.

**Mục tiêu:** Driver chọn garage đã được duyệt để dán decal cho contract được gán.

```mermaid
sequenceDiagram
    title Driver chọn garage dán decal
    actor Driver as Driver
    participant DriverUI as Màn hình chọn garage
    participant Action as selectDriverInstallGarage
    participant DB as Supabase Database
    actor Garage as Garage
    Driver->>DriverUI: Xem danh sách garage khả dụng
    DriverUI->>DB: Tải contract của Driver và garage đã duyệt
    Driver->>DriverUI: Chọn garage dán decal
    DriverUI->>Action: Gửi contractId và garageId
    Action->>DB: Kiểm tra contract thuộc Driver và trạng thái hợp lệ
    Action->>DB: Cập nhật garage đã chọn và trạng thái chờ lắp
    DB->>Garage: Job lắp decal xuất hiện trong lịch garage
    DriverUI->>Driver: Thông báo đã chọn garage
```

### 5. Garage dán decal và Admin duyệt ảnh sau dán

**Actor chính:** Garage và Platform/Admin.

**Mục tiêu:** Garage tải ảnh sau khi dán decal; Admin duyệt ảnh sau dán để mở earning.

```mermaid
sequenceDiagram
    title Garage dán decal và Admin duyệt ảnh sau dán
    actor Garage as Garage
    participant GarageUI as Giao diện Garage
    participant ProofAction as submitGarageInstallProof
    participant Storage as Supabase Storage
    participant DB as Supabase Database
    actor Admin as Platform/Admin
    participant ReviewAction as reviewInstallProof
    actor Driver as Driver
    Garage->>GarageUI: Mở lịch lắp decal được giao
    GarageUI->>DB: Tải thông tin contract, Driver, xe, campaign
    Garage->>GarageUI: Tải ảnh sau khi dán decal
    GarageUI->>ProofAction: Gửi proof lắp đặt
    ProofAction->>Storage: Lưu ảnh proof decal
    ProofAction->>DB: Ghi photos và chuyển contract sang chờ duyệt
    Admin->>ReviewAction: Mở request ảnh decal sau dán
    ReviewAction->>DB: Tải ảnh proof và thông tin contract
    Admin->>ReviewAction: Duyệt hoặc từ chối request
    ReviewAction->>DB: Cập nhật trạng thái proof và contract
    DB->>Driver: Cập nhật trạng thái xác thực decal sau dán
    DB->>Garage: Cập nhật nguồn thu lắp decal nếu được duyệt
```

### 6. Driver gửi ảnh xác minh decal hằng tháng

**Actor chính:** Driver.

**Mục tiêu:** Driver gửi ảnh xác minh decal định kỳ mỗi tháng; Platform/Admin duyệt hoặc từ chối ảnh để cập nhật trạng thái hợp lệ.

```mermaid
sequenceDiagram
    title Driver gửi ảnh xác minh decal hằng tháng
    actor Driver as Driver
    participant DriverUI as Giao diện xác minh decal
    participant SubmitAction as submitMonthlyDecalVerification
    participant Storage as Supabase Storage
    participant DB as Supabase Database/RPC
    actor Admin as Platform/Admin
    participant ReviewAction as reviewMonthlyDecalVerification
    Driver->>DriverUI: Mở yêu cầu xác minh decal tháng hiện tại
    Driver->>DriverUI: Tải ảnh decal hiện trạng
    DriverUI->>SubmitAction: Gửi ảnh xác minh decal
    SubmitAction->>Storage: Lưu ảnh xác minh decal
    SubmitAction->>DB: Tạo request xác minh trạng thái chờ duyệt
    Admin->>ReviewAction: Mở request xác minh decal hằng tháng
    ReviewAction->>DB: Tải ảnh, Driver, campaign và contract liên quan
    Admin->>ReviewAction: Duyệt hoặc từ chối ảnh xác minh
    ReviewAction->>DB: Cập nhật trạng thái xác minh tháng
    DB->>DriverUI: Hiển thị kết quả duyệt cho Driver
```

### 7. Driver xem thu nhập và yêu cầu rút tiền

**Actor chính:** Driver.

**Mục tiêu:** Driver xem thống kê thu nhập, tạo hóa đơn/rút tiền; Admin xử lý payout thủ công.

```mermaid
sequenceDiagram
    title Driver xem thu nhập và yêu cầu rút tiền
    actor Driver as Driver
    participant DriverUI as Dashboard/Thu nhập Driver
    participant InvoiceAction as Server action hóa đơn Driver
    participant DB as Supabase Database/RPC
    actor Admin as Platform/Admin
    Driver->>DriverUI: Xem thống kê thu nhập
    DriverUI->>DB: Tải contract đang chạy, kỳ thu nhập, hóa đơn
    DB->>DriverUI: Trả tổng thu nhập và trạng thái thanh toán
    Driver->>DriverUI: Tạo yêu cầu rút tiền
    DriverUI->>InvoiceAction: Gửi yêu cầu tạo hóa đơn
    InvoiceAction->>DB: Kiểm tra kỳ thu nhập và tạo invoice
    Admin->>DB: Duyệt yêu cầu rút tiền Driver
    Admin->>DB: Ghi nhận chuyển khoản thủ công và đánh dấu payout đã thanh toán
    DB->>DriverUI: Cập nhật trạng thái paid
```

### 8. Garage cập nhật hồ sơ, xem lịch và nguồn thu

**Actor chính:** Garage.

**Mục tiêu:** Garage cập nhật thông tin, xem lịch lắp decal và thống kê nguồn thu theo tháng.

```mermaid
sequenceDiagram
    title Garage cập nhật hồ sơ, xem lịch và nguồn thu
    actor Garage as Garage
    participant GarageUI as Giao diện Garage
    participant ProfileAction as updateGarageProfile
    participant DB as Supabase Database/RPC
    Garage->>GarageUI: Cập nhật tên, địa chỉ, Google Maps, thanh toán
    GarageUI->>ProfileAction: Gửi thông tin garage
    ProfileAction->>DB: Cập nhật garages và reset xác minh tài khoản nhận tiền nếu cần
    Garage->>GarageUI: Xem lịch lắp decal
    GarageUI->>DB: Tải contracts đã chọn garage này
    DB->>GarageUI: Trả danh sách job lắp decal
    Garage->>GarageUI: Xem nguồn thu tháng
    GarageUI->>DB: Tải garage earnings, withdrawals và invoices
    DB->>GarageUI: Trả tổng nguồn thu theo tháng
```

### 9. Garage yêu cầu rút tiền

**Actor chính:** Garage.

**Mục tiêu:** Garage gửi yêu cầu rút tiền từ nguồn thu; Admin duyệt và chuyển khoản thủ công.

```mermaid
sequenceDiagram
    title Garage yêu cầu rút tiền
    actor Garage as Garage
    participant GarageUI as Giao diện nguồn thu Garage
    participant WithdrawalAction as requestGarageWithdrawal
    participant DB as Supabase Database/RPC
    actor Admin as Platform/Admin
    Garage->>GarageUI: Nhập số tiền muốn rút
    GarageUI->>WithdrawalAction: Gửi yêu cầu rút tiền
    WithdrawalAction->>DB: Kiểm tra garage đã duyệt, tài khoản nhận tiền, số dư
    WithdrawalAction->>DB: Tạo withdrawal chờ duyệt
    Admin->>DB: Duyệt withdrawal garage
    Admin->>DB: Ghi nhận chuyển khoản thủ công và đánh dấu paid hoặc failed
    DB->>GarageUI: Cập nhật trạng thái withdrawal
```

### 10. Partner gửi thông tin doanh nghiệp

**Actor chính:** Partner.

**Mục tiêu:** Partner đăng ký, gửi thông tin doanh nghiệp và chờ Admin duyệt trước khi tạo campaign.

```mermaid
sequenceDiagram
    title Partner gửi thông tin doanh nghiệp
    actor Partner as Partner
    participant PartnerUI as Hồ sơ Partner ban đầu
    participant Action as submitPartnerProfile
    participant DB as Supabase Database
    actor Admin as Platform/Admin
    participant Email as Dịch vụ email
    Partner->>PartnerUI: Nhập tên doanh nghiệp, mã số thuế, địa chỉ, liên hệ
    PartnerUI->>Action: Gửi hồ sơ doanh nghiệp
    Action->>DB: Upsert partners và profiles
    DB->>PartnerUI: Trả trạng thái chờ duyệt
    Admin->>DB: Xem hồ sơ Partner
    Admin->>DB: Duyệt hoặc từ chối Partner
    DB->>Email: Gửi thông báo kết quả nếu cấu hình email bật
    PartnerUI->>Partner: Hiển thị trạng thái doanh nghiệp
```

### 11. Partner nạp tiền tự động

**Actor chính:** Partner.

**Mục tiêu:** Partner nạp tiền tự động; cơ chế xác nhận giao dịch cộng ví và cập nhật dashboard.

```mermaid
sequenceDiagram
    title Partner nạp tiền tự động
    actor Partner as Partner
    participant BillingUI as Màn hình nạp tiền
    participant Webhook as Webhook nạp tiền
    participant DB as Supabase Database/RPC
    Partner->>BillingUI: Xem QR nạp tiền
    Partner->>BillingUI: Thực hiện chuyển khoản với nội dung nạp tiền
    Webhook->>DB: Nhận payload giao dịch nạp tiền
    Webhook->>DB: Kiểm tra API key, giao dịch trùng, số tiền tối thiểu
    DB->>DB: Cộng balance Partner và ghi ledger partner_topup
    DB->>BillingUI: Revalidate billing/dashboard
    BillingUI->>Partner: Hiển thị số tiền hiện tại
```

### 12. Partner tạo và chỉnh sửa campaign trước duyệt

**Actor chính:** Partner.

**Mục tiêu:** Partner tạo campaign, upload creative, chỉnh sửa trước khi Admin duyệt; Admin duyệt campaign để đưa vào vận hành.

```mermaid
sequenceDiagram
    title Partner tạo và chỉnh sửa campaign trước duyệt
    actor Partner as Partner
    participant CampaignUI as Giao diện campaign Partner
    participant CampaignAction as Server action campaign
    participant Storage as Supabase Storage
    participant DB as Supabase Database/RPC
    actor Admin as Platform/Admin
    Partner->>CampaignUI: Nhập tên, gói, thời gian, số driver, ngân sách tháng
    Partner->>CampaignUI: Upload creative
    CampaignUI->>Storage: Lưu creative campaign
    Partner->>CampaignUI: Tạo campaign
    CampaignUI->>CampaignAction: Gửi thông tin campaign
    CampaignAction->>DB: Kiểm tra Partner đã duyệt và đủ balance
    CampaignAction->>DB: Reserve ngân sách và tạo campaign chờ duyệt
    Partner->>CampaignUI: Chỉnh sửa campaign khi chưa được duyệt
    CampaignUI->>DB: Cập nhật draft/submitted campaign nếu còn được phép
    Admin->>DB: Xem danh sách campaign chờ duyệt
    Admin->>DB: Duyệt hoặc từ chối campaign
    DB->>CampaignUI: Cập nhật trạng thái campaign
```

### 13. Partner xem dashboard và thống kê chi phí

**Actor chính:** Partner.

**Mục tiêu:** Partner xem dashboard thống kê và thống kê chi phí hằng tháng. Trạng thái campaign hết gói chỉ là rule/trạng thái, không phải use case riêng.

```mermaid
sequenceDiagram
    title Partner xem dashboard và thống kê chi phí
    actor Partner as Partner
    participant Dashboard as Dashboard Partner
    participant DB as Supabase Database/RPC
    Partner->>Dashboard: Mở dashboard Partner
    Dashboard->>DB: Tải số tiền hiện tại, tổng campaign, tổng Driver
    Dashboard->>DB: Tải monthly budget usage và danh sách campaign
    DB->>Dashboard: Trả dữ liệu dashboard
    Partner->>Dashboard: Mở thống kê chi phí tháng
    Dashboard->>DB: Tải tiền trả Driver, công garage, chi phí khác
    DB->>Dashboard: Trả báo cáo chi phí tháng
```

### 14. Admin dashboard, hóa đơn và lợi nhuận

**Actor chính:** Platform/Admin.

**Mục tiêu:** Admin xem dashboard hệ thống, hóa đơn và thống kê lợi nhuận.

```mermaid
sequenceDiagram
    title Admin dashboard, hóa đơn và lợi nhuận
    actor Admin as Platform/Admin
    participant AdminUI as Giao diện Admin
    participant Query as Admin query library
    participant DB as Supabase Database/RPC
    Admin->>AdminUI: Mở dashboard hệ thống
    AdminUI->>Query: Tải active drivers, campaigns, doanh thu, lợi nhuận
    Query->>DB: Truy vấn profiles, campaigns, invoices, ledger_entries
    DB->>AdminUI: Trả KPI hệ thống
    Admin->>AdminUI: Mở danh sách hóa đơn
    AdminUI->>Query: Tải hóa đơn Driver, Partner, Garage
    Query->>DB: Truy vấn invoice và withdrawal theo tháng
    DB->>AdminUI: Trả danh sách hóa đơn
    Admin->>AdminUI: Mở thống kê lợi nhuận
    AdminUI->>Query: Tính doanh thu, chi phí, lợi nhuận
    Query->>DB: Đọc driver payout, garage payout, partner charge, fee
    DB->>AdminUI: Trả báo cáo lợi nhuận
```

### 15. Admin gán Driver vào campaign

**Actor chính:** Platform/Admin.

**Mục tiêu:** Admin chọn Driver/xe phù hợp và gán vào campaign để tạo contract.

```mermaid
sequenceDiagram
    title Admin gán Driver vào campaign
    actor Admin as Platform/Admin
    participant AdminUI as Workspace campaign
    participant ContractAction as Server action contract
    participant DB as Supabase Database/RPC
    actor Partner as Partner
    actor Driver as Driver
    actor Garage as Garage
    Admin->>AdminUI: Chọn campaign đã duyệt
    AdminUI->>DB: Tải danh sách Driver và xe đủ điều kiện
    Admin->>AdminUI: Chọn Driver, xe và garage nếu có
    AdminUI->>ContractAction: Gửi yêu cầu tạo contract
    ContractAction->>DB: Kiểm tra campaign, Driver, vehicle, garage
    ContractAction->>DB: Tạo contract trạng thái matched
    ContractAction->>DB: Chuyển campaign sang chờ lắp nếu cần
    DB->>Partner: Cập nhật số Driver của campaign
    DB->>Driver: Campaign xuất hiện ở dashboard Driver
    DB->>Garage: Job xuất hiện nếu đã gán garage
```

### 16. Admin quản lý payout, thông số và role

**Actor chính:** Platform/Admin.

**Mục tiêu:** Admin xử lý rút tiền, chỉnh thông số hệ thống và quản lý người dùng/role.

```mermaid
sequenceDiagram
    title Admin quản lý payout, thông số và role
    actor Admin as Platform/Admin
    participant AdminUI as Giao diện Admin
    participant PayoutAction as Server action payout
    participant SettingsAction as Server action pricing/settings
    participant UserAction as Server action users
    participant DB as Supabase Database/RPC
    participant Auth as Supabase Auth
    Admin->>AdminUI: Mở hàng đợi rút tiền Driver/Garage
    AdminUI->>PayoutAction: Duyệt, từ chối hoặc đánh dấu đã trả
    PayoutAction->>DB: Cập nhật invoice, withdrawal, payout và ledger_entries
    PayoutAction->>DB: Ghi nhận thao tác chuyển khoản thủ công khi đã xử lý
    Admin->>AdminUI: Mở thông số hệ thống
    AdminUI->>SettingsAction: Lưu giá dán decal, mức rút/nạp tối thiểu, phí hệ thống
    SettingsAction->>DB: Cập nhật pricing/settings
    Admin->>AdminUI: Mở quản lý người dùng
    AdminUI->>UserAction: Tạo, khóa, mở khóa hoặc đổi role
    UserAction->>Auth: Tạo hoặc cập nhật tài khoản auth khi cần
    UserAction->>DB: Cập nhật profiles và role
```

## 6. Ghi Chú Cho Phần Cần Làm Rõ

1. Nếu Partner được phép chỉnh campaign trước duyệt, cần bổ sung server action và rule chỉ cho sửa khi campaign chưa được Admin duyệt.
2. Campaign hết gói chỉ nên mô tả như rule/trạng thái của campaign, không đưa thành UC riêng.
3. Cập nhật thông tin xe không đưa thành UC riêng vì hiện không có thao tác demo rõ cho Driver.
