# Đồ Án: Biểu Đồ Trình Tự Các Ca Sử Dụng

## 1. Phạm Vi

Tài liệu này trình bày sequence diagram theo scope demo hiện tại của VehicalAdvertise. Bộ sequence dùng 4 actor chính: Driver, Garage, Partner và Platform/Admin. Các chi tiết kỹ thuật như Supabase Auth, Database, Storage, SePay, audit log hoặc GPS tracking không vẽ như actor/lifeline riêng trong bộ sequence tổng quát; chúng được gom vào participant **Hệ thống VehicalAdvertise**.

File import draw.io: `docs/sequence-usecases.drawio`.

## 2. Nhóm Sequence

| Trang | Nội dung                                           | Use case bao phủ            |
| ----- | -------------------------------------------------- | --------------------------- |
| 1     | Đăng ký, đăng nhập và hoàn thiện hồ sơ ban đầu     | AUTH01-AUTH04               |
| 2     | Driver tham gia campaign và xác thực decal         | D01-D05, G03, A02, A05, A06 |
| 3     | Driver xem thu nhập và yêu cầu rút tiền            | D06, A08                    |
| 4     | Garage quản lý lắp decal, proof và rút tiền        | G01-G04, A05, A08           |
| 5     | Partner gửi hồ sơ, nạp tiền và tạo campaign        | P01-P03, A02, A03           |
| 6     | Partner xem dashboard và chi phí hằng tháng        | P04-P05                     |
| 7     | Platform/Admin gán Driver và duyệt vận hành        | A01, A04-A06                |
| 8     | Platform/Admin quản lý tài chính, thông số và role | A07-A10                     |

## 3. Sequence Diagram

### 1. Đăng ký, đăng nhập và hoàn thiện hồ sơ ban đầu

```mermaid
sequenceDiagram
    title Đăng ký, đăng nhập và hoàn thiện hồ sơ ban đầu
    actor P1 as Driver/Partner
    participant P2 as Hệ thống VehicalAdvertise
    actor P3 as Platform/Admin
    P1->>P2: Đăng nhập bằng email/password
    P2->>P1: Điều hướng tới workspace theo role
    P1->>P2: Đăng ký email/password
    P2->>P1: Mở trang chọn vai trò
    P1->>P2: Chọn role Driver/Partner và gửi hồ sơ ban đầu
    P2->>P3: Đưa hồ sơ vào hàng đợi duyệt
    P3->>P2: Duyệt hoặc từ chối hồ sơ
    P2->>P1: Hiển thị trạng thái approved/rejected/pending
```

### 2. Driver tham gia campaign và xác thực decal

```mermaid
sequenceDiagram
    title Driver tham gia campaign và xác thực decal
    actor P1 as Driver
    participant P2 as Hệ thống VehicalAdvertise
    actor P3 as Garage
    actor P4 as Platform/Admin
    P1->>P2: Gửi KYC/cập nhật hồ sơ và tài khoản nhận tiền
    P4->>P2: Duyệt KYC Driver
    P1->>P2: Chọn garage cho contract được gán
    P2->>P3: Hiển thị job lắp decal
    P3->>P2: Upload ảnh proof sau khi dán decal
    P2->>P4: Đưa proof vào queue duyệt
    P4->>P2: Duyệt hoặc từ chối proof decal
    P2->>P1: Cập nhật trạng thái decal/campaign
    P1->>P2: Gửi ảnh xác minh decal hằng tháng
    P4->>P2: Duyệt ảnh xác minh hằng tháng
    P2->>P1: Hiển thị trạng thái xác minh tháng
```

### 3. Driver xem thu nhập và yêu cầu rút tiền

```mermaid
sequenceDiagram
    title Driver xem thu nhập và yêu cầu rút tiền
    actor P1 as Driver
    participant P2 as Hệ thống VehicalAdvertise
    actor P3 as Platform/Admin
    P1->>P2: Xem dashboard thu nhập
    P2->>P1: Trả kỳ thu nhập, hóa đơn và trạng thái payout
    P1->>P2: Tạo hóa đơn rút tiền hằng tháng
    P2->>P3: Đưa yêu cầu rút tiền vào queue
    P3->>P2: Duyệt hoặc từ chối yêu cầu
    P3->>P2: Đánh dấu đã chuyển khoản thủ công
    P2->>P1: Cập nhật trạng thái paid/rejected
```

### 4. Garage quản lý lắp decal, proof và rút tiền

```mermaid
sequenceDiagram
    title Garage quản lý lắp decal, proof và rút tiền
    actor P1 as Garage
    participant P2 as Hệ thống VehicalAdvertise
    actor P3 as Platform/Admin
    P1->>P2: Cập nhật hồ sơ garage và tài khoản thanh toán
    P3->>P2: Duyệt garage nếu cần
    P1->>P2: Xem lịch lắp decal
    P1->>P2: Đăng tải ảnh sau khi dán decal
    P2->>P3: Gửi proof vào queue duyệt
    P3->>P2: Duyệt proof và ghi công lắp đặt
    P1->>P2: Xem nguồn thu và yêu cầu rút tiền
    P3->>P2: Duyệt/đánh dấu paid withdrawal
    P2->>P1: Cập nhật nguồn thu và trạng thái withdrawal
```

### 5. Partner gửi hồ sơ, nạp tiền và tạo campaign

```mermaid
sequenceDiagram
    title Partner gửi hồ sơ, nạp tiền và tạo campaign
    actor P1 as Partner
    participant P2 as Hệ thống VehicalAdvertise
    actor P3 as Platform/Admin
    P1->>P2: Gửi hồ sơ doanh nghiệp
    P2->>P3: Đưa hồ sơ Partner vào queue
    P3->>P2: Duyệt hoặc từ chối Partner
    P2->>P1: Cập nhật trạng thái doanh nghiệp
    P1->>P2: Nạp tiền tài khoản
    P2->>P1: Cập nhật số dư hiện tại
    P1->>P2: Tạo campaign và upload creative
    P2->>P3: Đưa creative/campaign vào queue duyệt
    P3->>P2: Duyệt hoặc từ chối campaign
    P2->>P1: Cập nhật trạng thái campaign
```

### 6. Partner xem dashboard và chi phí hằng tháng

```mermaid
sequenceDiagram
    title Partner xem dashboard và chi phí hằng tháng
    actor P1 as Partner
    participant P2 as Hệ thống VehicalAdvertise
    P1->>P2: Mở dashboard Partner
    P2->>P1: Trả số dư, tổng campaign, tổng Driver
    P2->>P1: Trả monthly budget usage và danh sách campaign
    P1->>P2: Mở hóa đơn/chi phí hằng tháng
    P2->>P1: Trả tiền Driver, công Garage, phí nền tảng, chi phí khác
```

### 7. Platform/Admin gán Driver và duyệt vận hành

```mermaid
sequenceDiagram
    title Platform/Admin gán Driver và duyệt vận hành
    actor P1 as Platform/Admin
    participant P2 as Hệ thống VehicalAdvertise
    actor P3 as Partner
    actor P4 as Driver
    actor P5 as Garage
    P1->>P2: Mở dashboard hệ thống
    P2->>P1: Trả active drivers, campaigns, doanh thu, lợi nhuận
    P1->>P2: Gán Driver/Vehicle/Garage vào campaign
    P2->>P3: Cập nhật số Driver/campaign
    P2->>P4: Campaign hiển thị để chọn garage
    P2->>P5: Job lắp decal hiển thị nếu đã gán garage
    P1->>P2: Duyệt install proof hoặc ảnh xác minh decal
    P2->>P4: Cập nhật trạng thái earning/verification
```

### 8. Platform/Admin quản lý tài chính, thông số và role

```mermaid
sequenceDiagram
    title Platform/Admin quản lý tài chính, thông số và role
    actor P1 as Platform/Admin
    participant P2 as Hệ thống VehicalAdvertise
    actor P3 as Driver
    actor P4 as Garage
    actor P5 as Partner
    P1->>P2: Xem hóa đơn và báo cáo lợi nhuận
    P2->>P1: Trả invoice Driver/Partner/Garage và lợi nhuận
    P1->>P2: Quản lý payout/rút tiền Driver và Garage
    P2->>P3: Cập nhật invoice/payout Driver
    P2->>P4: Cập nhật withdrawal Garage
    P1->>P2: Điều chỉnh giá dán decal, mức rút/nạp, phí hệ thống
    P1->>P2: Tạo, khóa, mở khóa hoặc đổi role user
    P2->>P5: Cập nhật quyền truy cập nếu liên quan
```

## 4. Ghi Chú Scope

- Partner chỉnh sửa campaign trước duyệt không vẽ trong sequence chính vì scout chưa thấy route/action update campaign từ phía Partner.
- Driver gửi ảnh xác minh decal hằng tháng được giữ theo scope đã chốt. Hiện phía Admin có queue review ảnh định kỳ; phía Driver cần route/action submit riêng nếu demo muốn thao tác đầy đủ.
- Campaign hết gói chỉ là rule/trạng thái campaign, không phải sequence/use case riêng.
- Cập nhật thông tin xe không tách thành sequence riêng; dữ liệu xe nằm trong hồ sơ/contract.
