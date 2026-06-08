# Codebase Summary

**Overview:** VehicalAdvertise là app Next.js 16 + TypeScript dùng Supabase Auth, Postgres, Storage và RLS. Scope demo hiện tại xoay quanh 4 actor nghiệp vụ: Driver, Garage, Partner, Platform/Admin. Luồng vận hành chính: đăng ký/onboarding, duyệt hồ sơ, tạo campaign, gán Driver/Vehicle/Garage, upload và duyệt ảnh decal, ghi nhận thu nhập, invoice và payout thủ công.

## Kế Hoạch Scout Chi Tiết Cho UML

| Bước | Phạm vi đọc                                                                | Mục tiêu                                                                         |
| ---- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1    | `README.md`, `AGENTS.md`, docs UML hiện có                                 | Khóa scope demo và quy ước không vẽ actor kỹ thuật                               |
| 2    | `src/types/db.ts`                                                          | Lấy schema cuối cùng sau toàn bộ migrations                                      |
| 3    | `supabase/migrations/0032` đến `0043`                                      | Xác nhận phần đã drop: GPS/QR/audit, vehicle detail, driver/pricing columns cũ   |
| 4    | `src/app/(public)`, `src/app/onboarding`, `src/lib/auth/*`, `src/proxy.ts` | Xác nhận auth, role, onboarding, gate Driver/Partner                             |
| 5    | `src/app/driver`, `src/lib/driver`, `src/components/driver`                | Xác nhận KYC, profile, plate, chọn garage, invoice/rút tiền                      |
| 6    | `src/app/garage`, `src/lib/garage`, `src/components/garage`                | Xác nhận profile garage, install jobs, upload proof, withdrawal                  |
| 7    | `src/app/partner`, `src/lib/partner`, `src/components/partner`             | Xác nhận partner onboarding, billing, campaign create, dashboard, invoices       |
| 8    | `src/app/admin`, `src/lib/admin`, `src/components/admin`                   | Xác nhận dashboard, approval queues, contract assignment, payout, pricing, users |
| 9    | `docs/use-case-overview.md`, `docs/sequence-usecases.md`                   | Đồng bộ class diagram với UC/sequence đã chốt                                    |

## Scope Chính Hiện Tại

| Actor          | Chức năng chính đã xác nhận                                                                                                                                                                                            |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Driver         | Đăng ký email/password, chọn role Driver, gửi KYC, cập nhật hồ sơ/tài khoản nhận tiền/biển số, chọn garage, xem trạng thái campaign/decal, tạo hóa đơn rút tiền hằng tháng                                             |
| Garage         | Đăng nhập, cập nhật hồ sơ garage và thanh toán, xem job lắp decal, upload 4 ảnh install proof, xem nguồn thu và yêu cầu rút tiền                                                                                       |
| Partner        | Đăng ký email/password, chọn role Partner, gửi hồ sơ doanh nghiệp, chờ Admin duyệt, nạp tiền, upload creative, tạo campaign bằng budget reserve, xem dashboard và invoices                                             |
| Platform/Admin | Dashboard hệ thống, duyệt Driver KYC, duyệt Partner, duyệt creative/campaign, gán Driver/Vehicle/Garage vào campaign, duyệt install proof, duyệt ảnh periodic, quản lý invoices/payouts, pricing settings, users/roles |

## Auth Và Onboarding

| Thành phần  | File chính                                             | Ghi chú                                                                                                 |
| ----------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Đăng ký     | `src/app/(public)/signup/signup-form.tsx`              | Supabase `auth.signUp`; lưu `full_name`, `phone` trong metadata                                         |
| Đăng nhập   | `src/app/(public)/login/email-sign-in-form.tsx`        | Supabase `signInWithPassword`; redirect về `/onboarding`                                                |
| Chọn role   | `src/app/onboarding/actions.ts`                        | RPC `choose_role`; chỉ Driver/Partner tự chọn role                                                      |
| Role gate   | `src/proxy.ts`, `src/lib/auth/role-gate.ts`            | `pending` bị giữ ở onboarding; Driver cần `kyc_status=approved`; Partner cần `partners.status=approved` |
| Tạo profile | `supabase/migrations/0005_handle_new_user_trigger.sql` | Trigger `handle_new_user()` tạo `profiles` khi có user auth mới                                         |

## App Routes Theo Actor

| Route                                    | Purpose                                                                     |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| `/driver/dashboard`                      | Driver xem trạng thái và thu nhập                                           |
| `/driver/verify`                         | Driver submit KYC lần đầu (`kyc_cccd_front`, `kyc_cccd_back`, `kyc_selfie`) |
| `/driver/profile`                        | Driver cập nhật hồ sơ, tài khoản nhận tiền và `vehicles.plate`              |
| `/driver/garage`                         | Driver chọn garage cho contract được gán                                    |
| `/driver/invoice`                        | Driver tạo/xem hóa đơn rút tiền                                             |
| `/garage/dashboard`                      | Garage xem nguồn thu/tình trạng job                                         |
| `/garage/installs`                       | Garage xem lịch/job lắp decal                                               |
| `/garage/proof-upload`                   | Garage upload 4 ảnh install proof                                           |
| `/garage/profile`, `/garage/payout`      | Garage cập nhật hồ sơ/thanh toán và yêu cầu rút tiền                        |
| `/partner/onboarding`                    | Partner gửi hồ sơ doanh nghiệp                                              |
| `/partner/dashboard`, `/partner/billing` | Partner xem số dư, ledger, dashboard                                        |
| `/partner/campaigns`                     | Partner upload creative và tạo campaign                                     |
| `/partner/invoices`                      | Partner xem chi phí Driver/Garage/platform theo campaign                    |
| `/admin/dashboard`                       | Admin xem active drivers, campaigns, doanh thu/lợi nhuận                    |
| `/admin/drivers-kyc`                     | Admin duyệt KYC Driver                                                      |
| `/admin/partners-approval`               | Admin duyệt Partner                                                         |
| `/admin/creatives-review`                | Admin duyệt campaign/creative                                               |
| `/admin/contracts`                       | Admin tạo/sửa/xóa/gán contract                                              |
| `/admin/install-proofs`                  | Admin duyệt ảnh sau dán decal                                               |
| `/admin/photo-verifications`             | Admin duyệt ảnh periodic Driver                                             |
| `/admin/invoices/*`, `/admin/payouts`    | Admin quản lý invoice/payout Driver/Garage/Partner                          |
| `/admin/pricing-settings`                | Admin cập nhật pricing config                                               |
| `/admin/users`                           | Admin quản lý users/roles/block/delete                                      |
| `/api/v1/webhooks/sepay`                 | Backend webhook nạp tiền Partner; không vẽ như actor UML tổng quát          |
| `/api/v1/admin/reports/[type]`           | Export CSV báo cáo tháng                                                    |

## CSDL Hiện Hành Cho Class Diagram

Nguồn chính: `src/types/db.ts`. Không lấy lại các bảng/cột chỉ còn trong `0001_schema.sql` nhưng đã bị migrations sau drop.

| Class/table                                      | Thuộc tính nghiệp vụ chính                                                                                                                                                                                                                                |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Profile` / `profiles`                           | `id`, `role`, `full_name`, `phone_e164`, `email`, `kyc_status`, `kyc_reviewed_by`, `kyc_reviewed_at`, `blocked`                                                                                                                                           |
| `Driver` / `drivers`                             | `id`, `cccd_number`, `body_type`, `primary_city`, `bank_account_name`, `bank_account_number`, `bank_name`                                                                                                                                                 |
| `Partner` / `partners`                           | `id`, `company_name`, `tax_code`, `billing_address`, `balance_vnd`, `status`, `approved_at`, `reject_reason`                                                                                                                                              |
| `Garage` / `garages`                             | `id`, `shop_name`, `address`, `google_maps_url`, `contact_name`, `phone`, `service_area`, `working_hours`, `bank_*`, `balance_vnd`, `approved`                                                                                                            |
| `Vehicle` / `vehicles`                           | `id`, `driver_id`, `plate`, `approved`                                                                                                                                                                                                                    |
| `Campaign` / `campaigns`                         | `id`, `partner_id`, `name`, `brief`, `creative_urls`, `qr_target_url`, `budget_vnd`, `spent_vnd`, `monthly_budget_vnd`, `driver_net_monthly_vnd`, `platform_fee_pct`, `active_driver_limit`, `requested_driver_count`, `start_date`, `end_date`, `status` |
| `Contract` / `contracts`                         | `id`, `campaign_id`, `driver_id`, `vehicle_id`, `install_garage_id`, `status`, `garage_selected_at`, `installed_at`, `earning_start_date`, `km_total`, `install_note`                                                                                     |
| `PhotoVerification` / `photos`                   | `id`, `subject_id`, `subject_type`, `kind`, `storage_path`, `status`, `reviewed_by`, `reviewed_at`, `reject_reason`                                                                                                                                       |
| `DriverEarningPeriod` / `driver_earning_periods` | `id`, `campaign_id`, `contract_id`, `driver_id`, `period_start`, `period_end`, `gross_charge_vnd`, `platform_fee_vnd`, `driver_net_vnd`, `status`                                                                                                         |
| `DriverInvoice` / `driver_invoices`              | `id`, `invoice_number`, `driver_id`, `campaign_id`, `contract_id`, `earning_period_id`, `period_start`, `period_end`, `amount_vnd`, `status`, `bank_snapshot`, `invoice_html`, `payout_id`, `paid_at`                                                     |
| `Payout` / `payouts`                             | `id`, `driver_id`, `period_start`, `period_end`, `amount_vnd`, `status`, `paid_at`, `failure_reason`                                                                                                                                                      |
| `GarageEarning` / `garage_earnings`              | `id`, `garage_id`, `contract_id`, `photo_id`, `amount_vnd`, `source`, `approved_by`, `approved_at`                                                                                                                                                        |
| `GarageWithdrawal` / `garage_withdrawals`        | `id`, `withdrawal_number`, `garage_id`, `amount_vnd`, `status`, `bank_snapshot`, `invoice_html`, `paid_at`, `failure_reason`                                                                                                                              |
| `LedgerEntry` / `ledger_entries`                 | `id`, `kind`, `partner_id`, `driver_id`, `contract_id`, `amount_vnd`, `ref_type`, `ref_id`, `note`, `ts`                                                                                                                                                  |
| `PricingRule` / `pricing_rules`                  | `id`, `effective_from`, `install_fee_vnd`, `garage_minimum_withdrawal_vnd`, `partner_minimum_cap_vnd`, `platform_fee_pct`                                                                                                                                 |
| `SepayWebhookEvent` / `sepay_webhook_events`     | `id`, `txn_id`, `payload`, `received_at`, `processed_at`, `error`; technical integration log, không vẽ actor                                                                                                                                              |

## RPC Và Server Actions Chính

| Operation nghiệp vụ                                    | Code/RPC                                                                                                   |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `handleNewUser()`                                      | Supabase trigger `handle_new_user()`                                                                       |
| `chooseRole(role)`                                     | `src/app/onboarding/actions.ts`, RPC `choose_role`                                                         |
| `submitKyc()`                                          | `src/app/driver/verify/actions.ts`                                                                         |
| `updateDriverProfile()`                                | `src/app/driver/profile/actions.ts`                                                                        |
| `selectInstallGarage()`                                | `src/app/driver/garage/actions.ts`                                                                         |
| `createWithdrawalInvoice()`                            | `src/app/driver/invoice/actions.ts`, RPC `ensure_driver_monthly_earning_period`                            |
| `submitPartnerProfile()`                               | `src/app/partner/onboarding/actions.ts`                                                                    |
| `createCampaignWithReserve()`                          | `src/app/partner/campaigns/actions.ts`, RPC `partner_create_campaign_with_reserve`                         |
| `uploadCampaignCreative()`                             | `src/app/partner/campaigns/actions.ts`                                                                     |
| `updateGarageProfile()`                                | `src/app/garage/payout/actions.ts`                                                                         |
| `submitInstallProof()`                                 | `src/app/garage/proof-upload/actions.ts`                                                                   |
| `requestGarageWithdrawal()`                            | `src/app/garage/payout/actions.ts`, RPC `request_garage_withdrawal`                                        |
| `reviewDriverKyc()`                                    | `src/app/admin/drivers-kyc/actions.ts`, RPC `approve_driver_kyc`                                           |
| `approvePartner()` / `rejectPartner()`                 | `src/app/admin/partners-approval/actions.ts`                                                               |
| `reviewCampaign()`                                     | `src/app/admin/creatives-review/actions.ts`, RPC `approve_campaign`                                        |
| `createContract()` / `updateContractAssignment()`      | `src/app/admin/contracts/actions.ts`                                                                       |
| `reviewInstallProof()`                                 | `src/app/admin/install-proofs/actions.ts`, RPC `admin_review_install_proof`                                |
| `reviewPhotoVerif()`                                   | `src/app/admin/photo-verifications/actions.ts`                                                             |
| `approveDriverWithdrawal()` / `markDriverPayoutPaid()` | `src/app/admin/payouts/actions.ts`, RPC `admin_approve_driver_withdrawal`, `admin_mark_driver_payout_paid` |
| `reviewGarageWithdrawal()`                             | `src/app/admin/payouts/actions.ts`, RPC `admin_review_garage_withdrawal`                                   |
| `updatePricingSettings()`                              | `src/app/admin/pricing-settings/actions.ts`                                                                |
| `setUserBlocked()` / user admin ops                    | `src/app/admin/users/actions.ts`, RPC `set_user_blocked`, `admin_purge_user_data`                          |
| `processSepayPartnerTopupWebhook()`                    | `/api/v1/webhooks/sepay`, RPC `process_sepay_partner_topup_webhook`                                        |

## Phần Đã Lược Khỏi UML Tổng Quát

| Phần cũ                       | Trạng thái sau scout                                                                               |
| ----------------------------- | -------------------------------------------------------------------------------------------------- |
| GPS tracking / PostGIS        | `0032_drop_unused_tracking_tables.sql` drop `gps_logs`, PostGIS                                    |
| QR scan / daily stats         | `0032` drop `qr_scans`, `contract_daily_stats`                                                     |
| Audit log                     | `0033_drop_audit_log.sql` drop `audit_log`, recreate RPC bỏ audit writes                           |
| GPS metadata ảnh              | `0036_drop_unused_columns.sql` drop `photos.exif_*`, `photos.client_*`                             |
| Vehicle fuel/brand/model      | `0037_drop_vehicle_detail_columns.sql` drop `vehicles.fuel`, `brand`, `model`, enum `vehicle_fuel` |
| Driver rating/bank_bin/branch | `0036`, `0038` drop khỏi `drivers`                                                                 |
| Pricing km columns            | `0041_drop_pricing_rules_km_columns.sql` drop km-pricing config                                    |
| Manual ledger adjustment      | `0035_remove_ledger_adjustments.sql`; final enum không còn `adjustment/refund`                     |
| Campaign RPC columns cũ       | `0039`, `0043` drop km/unused RPC columns                                                          |

## Ghi Chú Cho UML

- Use case và sequence chỉ vẽ 4 actor chính. Supabase, SePay, Storage, email là chi tiết triển khai.
- Class diagram được phép có class kỹ thuật `SepayWebhookEvent` nếu cần trình bày CSDL, nhưng không vẽ như actor.
- `PlatformAdmin` không có bảng riêng; là `profiles.role = 'admin'` cộng server actions/RPC admin.
- `Vehicle` hiện chỉ giữ `plate` và `approved`; không còn `fuel`, `brand`, `model`.
- `Contract.km_total` còn trong CSDL và vài admin query, nhưng GPS/km earning đã bị loại khỏi scope demo.

## Unresolved Questions

1. Driver submit ảnh xác minh decal hằng tháng: Admin queue/review đã có `periodic_vehicle`/`periodic_selfie`, nhưng chưa thấy route/action Driver submit riêng.
2. Partner chỉnh sửa campaign trước duyệt: chưa thấy server action update campaign từ phía Partner.
