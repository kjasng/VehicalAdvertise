# Biểu Đồ Lớp Theo Cơ Sở Dữ Liệu

## 1. Phạm Vi

Biểu đồ lớp mô tả các lớp nghiệp vụ chính của demo VehicalAdvertise sau khi scout lại codebase. Nguồn chính là `src/types/db.ts`; các migration cuối dùng để xác nhận bảng/cột cũ đã bị loại. File import draw.io: `docs/class-diagram.drawio`.

Bản draw.io được tách thành 4 trang để dễ đọc:

- `01 Tài khoản & hồ sơ`
- `02 Campaign & decal`
- `03 Thu nhập & payout`
- `04 Quản trị & tích hợp`

## 2. Quy Ước

- `Profile` là lớp cha nghiệp vụ cho tài khoản. `Driver`, `Partner`, `Garage` dùng khóa chính trùng `profiles.id`; biểu đồ trình bày như kế thừa để dễ hiểu trong đồ án.
- `PlatformAdmin` không có bảng riêng; đây là `profiles.role = admin` và các server action/RPC dành cho Admin.
- `PhotoVerification` ánh xạ từ bảng `photos`; `photo_kind` phân biệt KYC, install proof và ảnh periodic.
- `SepayWebhookEvent` là bảng log tích hợp nạp tiền, không phải actor trong UML use case/sequence.
- `Vehicle` hiện chỉ giữ `plate` và `approved`; không còn `fuel`, `brand`, `model`.
- `Contract.kmTotal` còn trong CSDL/admin query, nhưng GPS tracking và GPS-based earning đã bị loại khỏi scope demo.
- Thuộc tính dưới đây ưu tiên cột nghiệp vụ và FK quan trọng; một số timestamp kỹ thuật như `created_at` được lược để diagram dễ đọc.

## 3. Nhóm Lớp Chính

| Nhóm                   | Lớp                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| Tài khoản và hồ sơ     | `Profile`, `Driver`, `Partner`, `Garage`, `PlatformAdmin`, `Vehicle`                                 |
| Campaign và decal      | `Campaign`, `Contract`, `PhotoVerification`                                                          |
| Thu nhập và thanh toán | `DriverEarningPeriod`, `DriverInvoice`, `Payout`, `GarageEarning`, `GarageWithdrawal`, `LedgerEntry` |
| Cấu hình và tích hợp   | `PricingRule`, `SepayWebhookEvent`                                                                   |

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
        +kycReviewedBy: uuid
        +kycReviewedAt: timestamptz
        +blocked: boolean
        +handleNewUser()
        +chooseRole(role)
        +setUserBlocked(blocked)
    }

    class Driver {
        +id: uuid
        +cccdNumber: text
        +bodyType: text
        +primaryCity: text
        +bankAccountName: text
        +bankAccountNumber: text
        +bankName: text
        +submitKyc()
        +updateDriverProfile()
        +selectInstallGarage()
        +createWithdrawalInvoice()
    }

    class Partner {
        +id: uuid
        +companyName: text
        +taxCode: text
        +billingAddress: text
        +balanceVnd: bigint
        +status: partner_status
        +approvedAt: timestamptz
        +rejectReason: text
        +submitPartnerProfile()
        +uploadCampaignCreative()
        +createCampaignWithReserve()
        +viewCampaignInvoices()
    }

    class Garage {
        +id: uuid
        +shopName: text
        +address: text
        +googleMapsUrl: text
        +contactName: text
        +phone: text
        +serviceArea: text
        +workingHours: text
        +bankAccountName: text
        +bankAccountNumber: text
        +bankName: text
        +balanceVnd: bigint
        +approved: boolean
        +updateGarageProfile()
        +submitInstallProof()
        +requestGarageWithdrawal()
    }

    class PlatformAdmin {
        +id: uuid
        +role: admin
        +blocked: boolean
        +reviewDriverKyc()
        +approvePartner()
        +reviewCampaign()
        +createContract()
        +updateContractAssignment()
        +reviewInstallProof()
        +reviewPhotoVerif()
        +managePayouts()
        +updatePricingSettings()
        +manageUsers()
    }

    class Vehicle {
        +id: uuid
        +driverId: uuid
        +plate: text
        +approved: boolean
        +updatePlate()
        +linkToDriver()
    }

    class Campaign {
        +id: uuid
        +partnerId: uuid
        +name: text
        +brief: text
        +creativeUrls: text[]
        +qrTargetUrl: text
        +budgetVnd: bigint
        +spentVnd: bigint
        +monthlyBudgetVnd: bigint
        +driverNetMonthlyVnd: bigint
        +platformFeePct: numeric
        +activeDriverLimit: int
        +requestedDriverCount: int
        +startDate: date
        +endDate: date
        +status: campaign_status
        +rejectReason: text
        +createWithReserve()
        +reviewCampaign()
        +updateCampaignFunding()
        +transitionCampaign()
    }

    class Contract {
        +id: uuid
        +campaignId: uuid
        +driverId: uuid
        +vehicleId: uuid
        +installGarageId: uuid
        +status: contract_status
        +garageSelectedAt: timestamptz
        +installedAt: timestamptz
        +earningStartDate: date
        +kmTotal: numeric
        +installNote: text
        +createContract()
        +updateAssignment()
        +selectInstallGarage()
        +advanceStatus()
        +terminateContract()
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
        +rejectReason: text
        +submitKycPhotos()
        +submitInstallProof()
        +reviewInstallProof()
        +reviewPhotoVerif()
    }

    class DriverEarningPeriod {
        +id: uuid
        +campaignId: uuid
        +contractId: uuid
        +driverId: uuid
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
        +campaignId: uuid
        +contractId: uuid
        +earningPeriodId: uuid
        +periodStart: date
        +periodEnd: date
        +amountVnd: bigint
        +status: driver_invoice_status
        +bankSnapshot: jsonb
        +invoiceHtml: text
        +payoutId: uuid
        +paidAt: timestamptz
        +createWithdrawalInvoice()
        +approveDriverWithdrawal()
        +markDriverPayoutPaid()
    }

    class Payout {
        +id: uuid
        +driverId: uuid
        +periodStart: date
        +periodEnd: date
        +amountVnd: bigint
        +status: payout_status
        +paidAt: timestamptz
        +failureReason: text
        +markDriverPayoutPaid()
    }

    class GarageEarning {
        +id: uuid
        +garageId: uuid
        +contractId: uuid
        +photoId: uuid
        +amountVnd: bigint
        +source: text
        +approvedBy: uuid
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
        +invoiceHtml: text
        +paidAt: timestamptz
        +failureReason: text
        +requestGarageWithdrawal()
        +reviewGarageWithdrawal()
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
        +note: text
        +recordPartnerTopup()
        +reserveCampaignBudget()
        +recordDriverAccrual()
        +recordDriverPayout()
        +recordGarageInstallPayout()
        +recordPlatformFee()
    }

    class PricingRule {
        +id: uuid
        +effectiveFrom: date
        +installFeeVnd: bigint
        +garageMinimumWithdrawalVnd: bigint
        +partnerMinimumCapVnd: bigint
        +platformFeePct: numeric
        +insertPricingSettings()
        +getCurrentPricing()
    }

    class SepayWebhookEvent {
        +id: bigserial
        +txnId: text
        +payload: jsonb
        +receivedAt: timestamptz
        +processedAt: timestamptz
        +error: text
        +processTopupWebhook()
        +dedupeTransaction()
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
    Driver "1" --> "0..*" PhotoVerification : kyc_or_periodic
    Profile "1" --> "0..*" PhotoVerification : reviews
    Contract "1" --> "0..*" DriverEarningPeriod : accrues
    DriverEarningPeriod "1" --> "0..1" DriverInvoice : invoiced
    DriverInvoice "0..1" --> "0..1" Payout : paid_by
    Contract "1" --> "0..1" GarageEarning : install_fee
    Garage "1" --> "0..*" GarageEarning : earns
    Garage "1" --> "0..*" GarageWithdrawal : withdraws
    Partner "1" --> "0..*" LedgerEntry : wallet_entries
    Driver "1" --> "0..*" LedgerEntry : payout_entries
    Contract "1" --> "0..*" LedgerEntry : money_refs
    PricingRule ..> Campaign : pricing_inputs
    PricingRule ..> DriverEarningPeriod : earning_formula
    PricingRule ..> GarageWithdrawal : withdrawal_limits
    SepayWebhookEvent ..> LedgerEntry : partner_topup
```

## 5. Ghi Chú

- Phương thức trong biểu đồ là operation nghiệp vụ/server action/RPC tiêu biểu, không phải method OOP thật trong code.
- Không đưa GPS tracking, QR scan, audit log hoặc hệ thống lịch vào class diagram tổng quát vì bảng/luồng đó đã bị drop hoặc không còn scope demo.
- Không đưa `fuel`, `brand`, `model`, `vehicle_fuel`, `driver.rating`, `pricing_rules.active` vì không tồn tại trong schema cuối.
- Partner chỉnh sửa campaign trước duyệt chưa đưa vào method vì scout chưa thấy route/action update campaign từ phía Partner.
- Driver submit ảnh xác minh decal hằng tháng chưa có route/action submit riêng; class vẫn giữ `PhotoVerification.kind = periodic_vehicle/periodic_selfie` vì Admin queue/review đã có.
