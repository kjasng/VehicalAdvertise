# Codebase Summary

**Overview:** Next.js 16 + TypeScript monolith. Supabase (Postgres, Auth, Storage) + SePay. Four role panels (driver, partner, garage, admin) with shared shell architecture (sidebar + multi-page layout). RLS-enforced security; current earning flow is monthly driver accrual after admin-approved decal installation.

## App Routes

| Route                                | Purpose                                                                                                              |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `/driver`                            | Driver panel — dashboard, KYC verification, garage selection, monthly withdrawal invoices, profile + payout settings |
| `/partner`                           | Partner web — approved-only dashboard, Plan/top-up QR, campaign invoices, real campaign publish flow, ledger         |
| `/garage`                            | Garage web — real install jobs, 4-angle install proof upload, balance, profile/payout settings, withdrawal history   |
| `/admin`                             | Admin panel — dashboard, verification queues, campaigns, money ops, pricing, invoices/reports, users                 |
| `/(public)`                          | Landing, OAuth login (Google + GitHub), QR redirect                                                                  |
| `/onboarding`                        | Role selection & CCCD upload (pending users post-signup)                                                             |
| `/api/v1/*`                          | Route handlers — SePay auto top-up webhook, reports, QR tracking, state transitions                                  |
| `/api/v1/admin/reports/[type]` (GET) | Monthly CSV export for driver, partner, garage invoices and net profit; admin-auth guarded                           |

## Shared Shell Primitives

Located in `src/components/shared/`. All pure server components except noted.

| Component             | Purpose                                                                     |
| --------------------- | --------------------------------------------------------------------------- |
| `role-shell.tsx`      | Entrypoint — discriminated union (sidebar or bottom-nav variant)            |
| `role-sidebar.tsx`    | Dark desktop sidebar with nav items + user menu (active state via pathname) |
| `role-bottom-nav.tsx` | Fixed-bottom mobile tab bar, 2px accent border on active item               |
| `role-topbar.tsx`     | h-[64px] header for bottom-nav layout                                       |
| `role-user-menu.tsx`  | **Client component.** Avatar initials + dropdown (signOut action)           |
| `page-header.tsx`     | Kicker + Anton h1 + optional CTA button                                     |
| `kpi-card.tsx`        | Big-number card with green/red delta badge                                  |
| `section-shell.tsx`   | Bordered container; light/dark variant                                      |
| `empty-state.tsx`     | Pencil placeholder illustration (replaces old PlaceholderCard)              |

## Admin Shared Components

Located in `src/components/admin/` and `src/app/admin/*/`. Admin pages wire real Supabase data via query library; no mock data in pages.

| Component                        | Purpose                                                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `admin-nav-config.ts`            | ADMIN_NAV: sidebar groups/items for dashboard, verification, invoices, campaigns, money, and users                 |
| `data-table.tsx`                 | **Client component.** Generic `<DataTable<T>>` — sticky header, zebra rows, click-to-sort, pencil border colors    |
| `review-drawer.tsx`              | **Client component.** Slide-in-from-right with backdrop + Escape close, role=dialog a11y                           |
| `kyc-review-content.tsx`         | **Client component.** KYC review drawer body — CCCD photos, selfie, approve/reject actions                         |
| `creative-review-content.tsx`    | **Client component.** Creative review drawer body — image preview, spec list, approve/reject actions               |
| `photo-verif-review-content.tsx` | **Client component.** Photo verification drawer body — verify image, approve/reject with reason                    |
| `invoice-filters.tsx`            | **Client component.** Date range + search; lifted state via callback                                               |
| `invoice-table.tsx`              | **Client component.** InvoiceFilters + DataTable with real invoice rows, print links, and client-side filtering    |
| `monthly-finance-table.tsx`      | **Client component.** Monthly finance table with selectable invoice/profit metrics                                 |
| `weekly-km-chart.tsx`            | **Client component.** Recharts line chart accepting real data prop from dashboard                                  |
| `demo-badge.tsx`                 | Inline "DEMO" label; renders only when `NODE_ENV !== 'production'`                                                 |
| `kyc-queue-client.tsx`           | **Client component.** Drawer + DataTable for KYC queue; handles row selection and reviewer actions                 |
| `creatives-queue-client.tsx`     | **Client component.** Drawer + DataTable for creatives review; handles approval workflow                           |
| `install-proofs-client.tsx`      | **Client component.** Batch review drawer for 4-photo install proof submissions                                    |
| `photo-verif-queue-client.tsx`   | **Client component.** Drawer + DataTable for photo verification queue; interactive review + rejection handling     |
| `pricing-settings-client.tsx`    | **Client component.** Role-grouped settings; garage install payout is fixed 3.2m VND                               |
| `contracts-client.tsx`           | **Client component.** Campaign workspace with assignment filters and links to per-campaign analytics detail        |
| `payouts-client.tsx`             | **Client component.** Withdrawal request table reused inside Driver/Garage invoice pages with search/month filters |
| `garage-withdrawals-table.tsx`   | **Client component.** Garage withdrawal queue: approve, mark paid, or reject and refund balance                    |
| `users-table-client.tsx`         | **Client component.** DataTable with search params (?q=) for user filtering and status management                  |
| `mock-data.ts`                   | Reference data (not imported in any page; used only for component development and tests)                           |

## Admin Query Library

Located in `src/lib/admin/`. Server-side query helpers for dashboard, review queues, and reporting.

| Query                   | Purpose                                                                      |
| ----------------------- | ---------------------------------------------------------------------------- |
| `getDashboardStats`     | KPIs and recent request feed for admin dashboard                             |
| `getKycQueue`           | Pending KYC reviews with profile + document URLs                             |
| `getCreativesQueue`     | Campaign creatives awaiting approval                                         |
| `getInstallProofs`      | Contract-level 4-photo installation verification submissions                 |
| `getPhotoVerifications` | Photo verification queue                                                     |
| `getDriverInvoices`     | Driver withdrawal invoices from `driver_invoices` with print href            |
| `getPartnerInvoices`    | Partner campaign charge invoices from monthly earning periods                |
| `getGarageInvoices`     | Garage withdrawal invoices from `garage_withdrawals` with print href         |
| `getWithdrawalRequests` | Driver/Garage withdrawal request rows and nav badge counts for invoice pages |
| `getPricingSettings`    | Current role pricing rule for garage payout, partner cap, and driver rates   |
| `getRecentAdjustments`  | Recent manual `adjustment` / `refund` ledger entries                         |
| `getLedgerTargets`      | Partner + driver target list for admin ledger adjustments                    |
| `getUsers`              | Users list with role + status filtering                                      |
| `getReportsData(month)` | Monthly finance reports: driver paid, partner charges, garage paid, profit   |

## Admin Utilities

CSV export and report helpers in `src/lib/admin/`.

| Module           | Purpose                                                                     |
| ---------------- | --------------------------------------------------------------------------- |
| `csv-helpers.ts` | `toCsv()` (RFC 4180 + formula injection defense), `csvResponse()` (headers) |

## Driver Shared Components

Located in `src/components/driver/`. Support the driver panel (dashboard, KYC, invoices, profile).

| Component                         | Purpose                                                                                |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| `driver-nav-config.ts`            | DRIVER_NAV: Dashboard, Verify, Garage, Invoice, Profile with href + label + icon       |
| `today-card.tsx`                  | Dark SectionShell — km numeral (Anton 72px), earnings, campaign badge, "Go online" CTA |
| `weekly-km-chart.tsx`             | Recharts AreaChart, 7-day mock data, primary fill + stroke                             |
| `kyc-wizard.tsx`                  | 3-step state machine, StepIndicator, FileInput w/ camera capture, sonner toast stub    |
| `invoice-list-item.tsx`           | Expand/collapse `<details>` — monthly invoice number, period, amount, status pill      |
| `profile-vehicle-photo-input.tsx` | Isolated client component for camera file input (extracted to keep profile page ≤200)  |
| `mock-data.ts`                    | TodayStats, DailyKmPoint, VerificationPrompt, DriverInvoiceRow — VN realistic data     |

## Partner Shared Components

Located in `src/components/partner/`. Support the partner panel (campaigns, contracts, verification, ledger).

| Component                  | Purpose                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| `partner-nav-config.ts`    | PARTNER_NAV: flat sidebar items for partner workflows, including separate Plan and Invoices         |
| `campaign-form-wizard.tsx` | Real publish wizard: 3/6/12-month + Business packages, creative URLs, driver count, cap validation  |
| `campaign-card.tsx`        | Real campaign card with status mapping, requested drivers, monthly cap, and budget usage            |
| `campaign-budget-hint.tsx` | Partner budget hint for driver net, 10% platform fee, and 3.2m VND garage install reserve           |
| `plan-package-grid.tsx`    | Partner Plan cards: 3/6/12-month packages, Business option, fixed 1m driver/month modal QR checkout |
| `plan-checkout-modal.tsx`  | Plan checkout modal with selected package, QR payment, and bank transfer details                    |
| `topup-qr-card.tsx`        | SePay-compatible VietQR top-up image with 10m VND minimum deposit                                   |
| `ledger-table.tsx`         | Real partner ledger rows from `ledger_entries`                                                      |

## Garage Shared Components

Located in `src/components/garage/`. Support real garage install and payout workflows.

| Component                         | Purpose                                                                                               |
| --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `garage-nav-config.ts`            | GARAGE_NAV: Dashboard, Installs, Proof Upload, Invoices, Profile                                      |
| `install-card.tsx`                | Real install job summary card                                                                         |
| `install-detail-drawer.tsx`       | Install job detail drawer with driver, vehicle, campaign, proof state, upload CTA                     |
| `photo-capture-grid.tsx`          | 4-photo install proof uploader wired to Supabase Storage + `photos`                                   |
| `garage-payout-settings-form.tsx` | Garage profile + payout settings on `/garage/profile`                                                 |
| `garage-invoices-client.tsx`      | `/garage/payout` Invoices view: paid-invoices table + period filter + recent requests + modal trigger |
| `garage-invoice-table.tsx`        | Paid withdrawals rendered as a printable invoices table                                               |
| `garage-withdrawal-modal.tsx`     | Request payout modal: amount + read-only bank info from profile                                       |
| `payout-row.tsx`                  | Non-paid (recent) withdrawal request row with status pill + print link                                |

## Vietnamese Documents (invoices & contracts)

Printed money documents render as Vietnamese-style HTML (`dangerouslySetInnerHTML` on `/print` routes). **No tax/VAT/withholding** is applied for any party — amounts are unchanged. Shared primitives in `src/lib/shared/vn-doc/`.

| Module                              | Purpose                                                                                              |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `shared/vn-doc/format.ts`           | `escapeHtml`, `formatVndDong` ("1.000.000 đồng")                                                     |
| `shared/vn-doc/amount-in-words.ts`  | `amountInWords` — "số tiền bằng chữ" via `vn-num2words`                                              |
| `shared/vn-doc/doc-styles.ts`       | `BASE_DOC_CSS`, `vnNationalHeader()` (Quốc hiệu), `vnSignatureRow()`                                 |
| `shared/vn-doc/company-info.ts`     | `getCompanyInfo()` — seller "Bên A" identity (static + `COMPANY_*` env)                              |
| `driver/ad-lease-contract-html.ts`  | "Hợp đồng thuê vị trí quảng cáo trên xe ô tô" (Bên A/Bên B, CCCD + biển số; no tax clause)           |
| `driver/invoice-html.ts`            | VN driver payment invoice; stored combined with the lease contract in `driver_invoices.invoice_html` |
| `partner/invoice-html.ts`           | VN simple partner invoice (no VAT)                                                                   |
| `partner/acceptance-record-html.ts` | "Biên bản nghiệm thu" — vehicle plate list + signed install-proof photos                             |
| `garage/withdrawal-html.ts`         | "Hóa đơn dịch vụ thi công decal" (garage = bên bán, company = bên mua; no VAT)                       |

Print routes: `/driver/invoice/[id]/print` (RLS, own only), `/admin/invoices/{driver,partner}/[id]/print` (admin), `/garage/payout/[id]/print`.

## Auth & Gating

| Module                         | Purpose                                                                                                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/lib/auth/role-gate.ts`    | `getProfileRole(userId)` — reads `profiles.role` via service-role client; `requireRole(role)` — guards server pages                                                                  |
| `src/lib/auth/admin-bypass.ts` | `isAdminBypassEnabled()` — strict check `process.env.ADMIN_PANEL_BYPASS === 'true'`; `canAdminBypassPath(profileRole, requiredRole)` — allows admin to view other role panels in dev |
| `src/proxy.ts`                 | Middleware — session refresh, role check, redirect to `/onboarding` for pending, optional admin bypass, **sets `x-pathname` header for server layout pathname access**               |

## Design Reference

**Source of truth:** `plans/260525-2201-role-panels-pencil-redesign/design-tokens.md`

All components use:

- Colors: `#1a1a1a` (dark), `#cbccc9` (border), `#f7f8fa` (light bg), `#666666` (muted text)
- Typography: `font-heading` (Anton, uppercase, tight tracking), `text-sm`/`text-base` for body
- Borders: 1px `#cbccc9`, light pencil-sketch aesthetic
- Icons: Lucide React

## Key Conventions

1. **`x-pathname` header:** Set early in `proxy.ts`. Server layouts read via `headers().get('x-pathname')` to determine active nav item without client-side hooks.
2. **File size:** New garage flow files stay ≤ 200 lines.
3. **Real data wiring:** All admin pages fetch via `src/lib/admin/` query library (getKycQueue, getCreativesQueue, getInstallProofs, etc.). Mock-data.ts retained for reference only.
4. **Server/client boundary:** Pages are server components that fetch data; client wrapper components (e.g., kyc-queue-client) handle interactivity (drawers, state, actions).
5. **Action handlers:** Approve/reject/suspend now call real server actions (reviewDriverKyc, reviewCampaign, etc.) wired to Supabase security-definer RPCs.
