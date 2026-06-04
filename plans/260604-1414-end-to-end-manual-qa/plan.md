---
title: "Runbook QA thủ công end-to-end"
description: "Kế hoạch test thủ công A-Z cho flow nghiệp vụ từ nộp hồ sơ, campaign, install, earning, invoices, đến payout do admin duyệt."
status: sẵn sàng
priority: P1
effort: 1-2 ngày
branch: main
tags: [qa, e2e, partner, driver, garage, admin, payouts]
created: 2026-06-04
blockedBy: []
blocks: []
---

# Runbook QA thủ công end-to-end

## Tổng quan

Runbook này không test login và register. Bắt đầu bằng bốn session đã được tạo sẵn và đã đăng nhập: Admin, Partner, Driver, và Garage.

Flow chính:

`Nộp hồ sơ → Admin duyệt → Partner nạp tiền → Review campaign → Match contract → Driver chọn garage → Garage upload proof → Admin duyệt decal → Earning theo tháng → Driver tạo invoice → Payout driver thủ công → Payout garage thủ công`

## Phạm vi

- Kiểm tra hành vi MVP web hiện tại trên cả bốn role.
- Kiểm tra trạng thái DB, tính toàn vẹn dòng tiền, invoice có thể in, filters, và audit records.
- Chỉ dùng SQL dành cho test ở những chỗ UI chưa có hoặc cần giả lập thời gian.
- Ghi nhận các expected defect đã liệt kê trong [scout report](./reports/scout-report.md).

## Các phase

| Phase | Steps | Tên | Trạng thái |
| --- | --- | --- | --- |
| 1 | A-J | [Môi trường, fixtures, và nộp hồ sơ](./phase-01-environment-submissions.md) | Pending |
| 2 | K-N | [Partner nạp tiền, campaign, và contract](./phase-02-partner-campaign-contract.md) | Pending |
| 3 | O-R | [Chọn garage, install, và duyệt earning](./phase-03-install-earning-approval.md) | Pending |
| 4 | S-W | [Earning theo tháng, invoices, và payout thủ công](./phase-04-invoices-manual-payouts.md) | Pending |
| 5 | X-Z | [Admin regression, edge cases, và sign-off](./phase-05-regression-signoff.md) | Pending |

## Điều kiện bắt đầu

- Đã apply migrations đến `0021_manual_payout_review.sql`.
- Chỉ dùng database staging/test riêng.
- Bốn session role đã đăng nhập sẵn; runbook này không test auth.
- Đã chuẩn bị ảnh test và thông tin ngân hàng test.
- Tester có quyền truy cập Supabase SQL Editor để setup test-only và giả lập ngày.

## Quy tắc thực hiện

- Với mỗi lỗi, ghi lại route, timestamp, entity ID, screenshot, và DB evidence.
- Không bao giờ đánh dấu money test là pass chỉ dựa vào UI; phải verify ledger/balance/status rows.
- Không dùng lại production users hoặc tài khoản ngân hàng thật.
- Restore pricing settings và xóa test data sau khi sign-off.

## Điều kiện hoàn tất

- Toàn bộ happy-path A-Z pass.
- Không còn defect Critical hoặc High liên quan money integrity đang mở.
- Các defect dự kiến đã được xác nhận, ưu tiên, và assign.
- `pnpm lint`, `pnpm build`, và migration dry-run pass trước release.

## Phụ thuộc

- Product rules: [project-overview-pdr.md](../../docs/project-overview-pdr.md)
- Architecture và money flow: [system-architecture.md](../../docs/system-architecture.md)
- Driver lifecycle plan: [driver panel plan](../260603-0158-driver-panel-real-data-and-tracking/plan.md)
