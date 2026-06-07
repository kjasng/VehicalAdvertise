# Biểu Đồ Lớp Theo Cơ Sở Dữ Liệu

## 1. Phạm Vi

Biểu đồ lớp này mô tả các lớp nghiệp vụ chính của demo VehicalAdvertise dựa trên bảng CSDL Supabase và các RPC/server action đang tác động lên dữ liệu. Cách trình bày theo kiểu UML class box: tên lớp, thuộc tính, phương thức và quan hệ bội số.

File import draw.io: `docs/class-diagram.drawio`. File draw.io được tách thành 4 trang để dễ đọc:

- `01 Tài khoản & hồ sơ`
- `02 Campaign & decal`
- `03 Thu nhập Driver`
- `04 Garage & payout`

## 2. Quy Ước Thiết Kế

- `Profile` là lớp cha nghiệp vụ cho tài khoản trong hệ thống. Trong CSDL, các bảng `drivers`, `partners`, `garages` dùng khóa chính trùng `profiles.id`; vì vậy biểu đồ trình bày như quan hệ kế thừa để dễ hiểu trong đồ án.
- `PlatformAdmin` không có bảng riêng; lớp này biểu diễn `profiles.role = admin` và các server action/RPC dành cho Admin.
- `PhotoVerification` ánh xạ từ bảng `photos`. Ảnh sau dán decal và ảnh xác minh decal hằng tháng được phân biệt bằng `photo_kind`.
- `Campaign hết gói` không phải class/use case riêng; chỉ là rule/trạng thái của `Campaign`.
- `Vehicle` vẫn xuất hiện vì `contracts.vehicle_id` tồn tại trong CSDL, nhưng không xem “cập nhật thông tin xe” là use case riêng của Driver.
- Bản draw.io tách trang theo cụm quan hệ để tránh canvas quá dày và đường nối chồng chéo.

## 3. Nhóm Lớp Chính

| Nhóm                   | Lớp                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| Tài khoản và hồ sơ     | `Profile`, `Driver`, `Partner`, `Garage`, `PlatformAdmin`, `Vehicle`                                 |
| Campaign và decal      | `Campaign`, `Contract`, `PhotoVerification`                                                          |
| Thu nhập và thanh toán | `DriverEarningPeriod`, `DriverInvoice`, `Payout`, `GarageEarning`, `GarageWithdrawal`, `LedgerEntry` |
| Cấu hình               | `PricingRule`                                                                                        |

## 4. Biểu Đồ Lớp

```mermaid
classDiagram
    direction LR

    class Profile {
        +id: uuid
        +role: user_role
        +fullName: text
        +phoneE164: text
        +email: text
        +kycStatus: kyc_status
        +blocked: boolean
        +createdAt: timestamptz
        +handleNewUser()
        +chooseRole(role)
        +setUserBlocked(blocked)
    }

    class Driver {
        +id: uuid
        +cccdNumber: text
        +primaryCity: text
        +bankAccountNumber: text
        +bankAccountName: text
        +bankBin: text
        +rating: numeric
        +submitDriverProfile()
        +updatePayoutAccount()
        +requestWithdrawal()
    }

    class Partner {
        +id: uuid
        +companyName: text
        +taxCode: text
        +billingAddress: text
        +balanceVnd: bigint
        +status: partner_status
        +approvedAt: timestamptz
        +submitPartnerProfile()
        +topupBalance()
        +createCampaign()
        +editCampaignBeforeApproval()
    }

    class Garage {
        +id: uuid
        +shopName: text
        +address: text
        +googleMapsUrl: text
        +bankAccountNumber: text
        +balanceVnd: bigint
        +approved: boolean
        +updateGarageProfile()
        +submitInstallProof()
        +requestWithdrawal()
    }

    class PlatformAdmin {
        +id: uuid
        +role: admin
        +blocked: boolean
        +approveProfile()
        +approveCampaign()
        +assignDriverToCampaign()
        +reviewInstallProof()
        +reviewMonthlyDecalPhoto()
        +managePayout()
        +updatePricingSettings()
    }

    class Vehicle {
        +id: uuid
        +driverId: uuid
        +plate: text
        +fuel: vehicle_fuel
        +brand: text
        +model: text
        +approved: boolean
        +linkToDriver()
    }

    class Campaign {
        +id: uuid
        +partnerId: uuid
        +name: text
        +creativeUrl: text
        +budgetVnd: bigint
        +monthlyBudgetVnd: bigint
        +startDate: date
        +endDate: date
        +status: campaign_status
        +requestedDriverCount: int
        +createWithReserve()
        +editBeforeApproval()
        +approveCampaign()
        +transitionCampaign()
    }

    class Contract {
        +id: uuid
        +campaignId: uuid
        +vehicleId: uuid
        +driverId: uuid
        +installGarageId: uuid
        +status: contract_status
        +earningStartDate: date
        +earnedVnd: bigint
        +createContract()
        +selectGarage()
        +markInstallProofApproved()
        +startEarning()
    }

    class PhotoVerification {
        +id: uuid
        +subjectId: uuid
        +subjectType: text
        +kind: photo_kind
        +storagePath: text
        +status: photo_status
        +reviewedBy: uuid
        +reviewedAt: timestamptz
        +submitInstallProof()
        +submitMonthlyDecalVerification()
        +reviewInstallProof()
        +reviewMonthlyDecalVerification()
    }

    class DriverEarningPeriod {
        +id: uuid
        +contractId: uuid
        +periodStart: date
        +periodEnd: date
        +grossChargeVnd: bigint
        +platformFeeVnd: bigint
        +driverNetVnd: bigint
        +status: text
        +ensureMonthlyEarningPeriod()
        +markInvoiced()
    }

    class DriverInvoice {
        +id: uuid
        +invoiceNumber: text
        +driverId: uuid
        +amountVnd: bigint
        +status: driver_invoice_status
        +bankSnapshot: jsonb
        +payoutId: uuid
        +createWithdrawalInvoice()
        +approveWithdrawal()
        +markPayoutPaid()
    }

    class Payout {
        +id: uuid
        +driverId: uuid
        +periodStart: date
        +periodEnd: date
        +amountVnd: bigint
        +status: payout_status
        +paidAt: timestamptz
        +markPaid()
        +markFailed()
    }

    class GarageEarning {
        +id: uuid
        +garageId: uuid
        +contractId: uuid
        +photoId: uuid
        +amountVnd: bigint
        +source: text
        +approvedAt: timestamptz
        +creditInstallEarning()
    }

    class GarageWithdrawal {
        +id: uuid
        +withdrawalNumber: text
        +garageId: uuid
        +amountVnd: bigint
        +status: payout_status
        +bankSnapshot: jsonb
        +paidAt: timestamptz
        +requestWithdrawal()
        +reviewWithdrawal()
        +markPaid()
    }

    class LedgerEntry {
        +id: bigserial
        +ts: timestamptz
        +kind: ledger_kind
        +partnerId: uuid
        +driverId: uuid
        +contractId: uuid
        +amountVnd: bigint
        +refType: text
        +refId: text
        +recordPartnerTopup()
        +recordPartnerCharge()
        +recordDriverAccrual()
        +recordPlatformFee()
    }

    class PricingRule {
        +id: uuid
        +driverBaseMonthlyVnd: bigint
        +installFeeVnd: bigint
        +minWithdrawalVnd: bigint
        +minTopupVnd: bigint
        +platformFeePct: numeric
        +active: boolean
        +getActiveRule()
        +updatePricingSettings()
    }

    Profile <|-- Driver
    Profile <|-- Partner
    Profile <|-- Garage
    Profile <|-- PlatformAdmin

    Driver "1" --> "0..*" Vehicle : owns
    Partner "1" --> "0..*" Campaign : creates
    Campaign "1" --> "0..*" Contract : has
    Driver "1" --> "0..*" Contract : assigned
    Vehicle "1" --> "0..*" Contract : used_for
    Garage "0..1" --> "0..*" Contract : installs

    Contract "1" --> "0..*" PhotoVerification : install_proof
    Driver "1" --> "0..*" PhotoVerification : monthly_decal_photo
    PlatformAdmin "1" --> "0..*" PhotoVerification : reviews

    Contract "1" --> "0..*" DriverEarningPeriod : accrues
    DriverEarningPeriod "1" --> "0..1" DriverInvoice : invoiced
    DriverInvoice "0..1" --> "0..1" Payout : paid_by

    Garage "1" --> "0..*" GarageEarning : earns
    Garage "1" --> "0..*" GarageWithdrawal : withdraws

    Partner "1" --> "0..*" LedgerEntry : wallet_entries
    Driver "1" --> "0..*" LedgerEntry : balance_entries
    Contract "1" --> "0..*" LedgerEntry : money_refs

    PricingRule ..> Campaign : pricing_inputs
    PricingRule ..> DriverEarningPeriod : earning_formula
    PricingRule ..> GarageWithdrawal : withdrawal_limits
```

## 5. Ghi Chú

- Phương thức trong biểu đồ là RPC/server action chính, không phải method OOP thật trong code.
- Thuộc tính ưu tiên cột nghiệp vụ cần trình bày trong đồ án; CSDL còn một số cột kỹ thuật như timestamp, reviewer, reject reason.
- Các bảng GPS, QR scan, audit log và manual ledger adjustment đã bị loại khỏi scope demo nên không đưa vào biểu đồ lớp tổng quát.
