# System Architecture

Authoritative source: `plans/260513-1149-wheels-earner-day1/architecture.md`. This file is the docs-folder mirror — updated whenever the canonical plan changes.

## 1. Topology

```
Next.js 16 monolith (one deploy, segments per role)
  /driver           PWA   /partner  web   /admin  web   /garage  web
  /api/v1/*         Route Handlers (photos, webhooks, payouts, transitions)
  /(public)/        landing, OAuth login (Google + GitHub), QR redirect
  proxy.ts          Supabase session refresh + role gate

  ↕ Supabase (Postgres + Auth + Storage + Realtime + Edge fns)
  ↕ SePay  (VietQR top-up + payout)
  ↕ Vercel Cron (rollup, prompts, fraud sweep)
```

Monolith rationale: 1 deploy, 1 auth, shared component library. Split only when a module's traffic or release cadence justifies it.

## 2. Data plane

PostGIS is not part of the current final schema. Tables are grouped by domain:

| Group        | Tables                                                                                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity     | `profiles`, `partners`, `drivers`, `garages`                                                                                                               |
| Inventory    | `vehicles`                                                                                                                                                 |
| Campaigns    | `campaigns`, `contracts`                                                                                                                                   |
| Verification | `photos`                                                                                                                                                   |
| Money        | `ledger_entries`, `driver_earning_periods`, `driver_invoices`, `garage_earnings`, `garage_withdrawals`, `payouts`, `sepay_webhook_events`, `pricing_rules` |

Full DDL → `supabase/migrations/0001_schema.sql`. Enums and constraints normalise state and money correctness at the database level.

> Đã gỡ (migration `0032`/`0033`): `gps_logs` + extension PostGIS, `qr_scans`, `contract_daily_stats` (tracking GPS/QR chưa triển khai), và `audit_log` (write-only, không còn trang xem). Các RPC tiền/duyệt được tái tạo bỏ phần ghi audit.

## 3. Trust boundary

RLS is **deny-by-default**. Every table enables RLS in `0002_rls.sql`. Two writer modes:

- **RLS-scoped client** (`src/lib/supabase/server.ts`, `client.ts`): UI/API on behalf of the signed-in user. Limited to own rows.
- **Service-role client** (`src/lib/supabase/admin.ts`, server-only): Privileged writes — ledger entries, state transitions, payouts. Each callsite enforces its own authz.

Rule: anything touching money goes through a service-role API route/action. Never client → Postgres.

**Admin bypass flag (`ADMIN_PANEL_BYPASS`):** A dev-only env var (explicit opt-in, default false). When set to `"true"`, users whose `profiles.role = 'admin'` may visit `/driver`, `/partner`, and `/garage` routes without being redirected — useful for inspecting role panels during development. The bypass is routing-only and silent: RLS still enforces what data the admin can read/write at the DB level, and all writes continue to carry the admin's real `user_id`. Non-admin users are never affected regardless of flag state. **Critical for production: this flag MUST be unset in deployed environments (env var deleted from Vercel or `.env.local`) — no code change required.**

**Admin security-definer RPCs:** Admin review RPCs in `0010_admin_rpcs.sql` (`approve_driver_kyc`, `approve_campaign`, `set_user_blocked`) and money RPCs in `0014_admin_money_ledger_rpc.sql` / `0021_manual_payout_review.sql` are owned by postgres. Money RPCs check the actor is valid, perform balance writes in one DB transaction, and grant execute only to `service_role`. Generic ledger adjustments are removed; partner top-up remains the only admin-created money ledger entry through `admin_create_money_ledger_entry()`. `is_admin()` also requires `profiles.blocked = false`, so suspended admins lose DB admin-policy access.

## 4. State machines

```
campaign : draft → submitted → approved → awaiting_install → active → completed
                              ↘ rejected            active ↔ paused / cancelled
contract : matched → awaiting_install → installed → running → completed
                                                     ↘ disputed / terminated
```

Both enforced by `assert_transition(entity, from, to)` in `0003_functions.sql`, called from RPCs `transition_campaign` / `transition_contract`. UI cannot UPDATE status directly (RLS blocks).

## 5. Driver monthly earning pipeline

GPS/km earning is intentionally skipped for the current web-only phase.

Flow: driver profile approved → campaign assigned → driver chooses garage → garage uploads install proof → admin approves decal → contract becomes `running`, `earning_start_date` set.

Campaign creation reserves the full campaign budget via `partner_create_campaign_with_reserve()`: the RPC locks `partners.balance_vnd`, inserts the campaign, deducts the budget from available partner balance, and writes one `ledger_entries.partner_charge` with `ref_type = campaign_budget_reserve`.

After a completed monthly period, `ensure_driver_monthly_earning_period()` creates exactly one `driver_earning_periods` row per contract/period. It checks campaign funding mode (`monthly_cap` or `balance_percent`), campaign total budget, and optional active driver limit. Reserved campaigns consume campaign budget and create driver accrual without deducting the partner wallet again; admin later approves/marks the driver payout paid from the held funds. Legacy non-reserved campaigns still deduct partner balance per period.

## 6. Fraud signals (server-side, no client trust)

Current phase: earning gate requires approved profile, assigned campaign, selected garage, garage install proof, and admin decal approval. GPS fraud signals move to mobile/GPS phase.

## 7. Photo verification

Driver PWA / garage panel → compressed image (< 2 MB) → Supabase Storage signed URL → photo finalize → admin queue. Install proof approval is the earning gate.

Garage install proof upload requires four angle photos: front, rear, left, right. Admin review is contract-level: `admin_review_install_proof()` locks the latest 4-photo batch and approve/reject applies to all four photos in one transaction. Approval moves the contract to `running`, sets `earning_start_date`, credits one fixed 3.2m VND `garage_earnings` row, updates garage balance, and writes one `ledger_entries.garage_install_payout` row for the approved proof batch.

## 8. Vietnam stack wiring

- **Auth:** Supabase OAuth (Google + GitHub). No SMS dependency. Role assignment via `choose_role()` RPC post-signup (maps to `auth.users.raw_user_meta_data.role`).
- **Partner flow:** Pending partners are gated to onboarding until admin approval. Approved partners can generate SePay-compatible VietQR top-up images from Plan, publish campaigns to `submitted`, and must pass package duration, creative, monthly cap, and full campaign budget reserve checks. Standard packages are 3/6/12 months; Business allows flexible dates. Campaign creation calls `partner_create_campaign_with_reserve()` so the partner balance is locked and deducted atomically. Budget reserve includes driver net target, 10% platform fee, and the fixed 3.2m VND garage install cost per driver.
- **Partner invoices:** `/partner/invoices` summarizes each partner campaign budget, driver payout, garage payout, platform fee, and remaining balance after fees. Each campaign row now expands the actual payment lines from `driver_earning_periods` and `garage_earnings`; `/partner/invoices/[campaignId]/print` renders the same breakdown as a printable invoice that can be saved as PDF from the browser.
- **Admin campaigns:** Admin navigation uses Campaigns as the single workspace. Campaign analytics is shown on `/admin/contracts/[campaignId]` with budget burn, Cars/Drivers counts, formatted dates, and driver list instead of a separate analytics nav page.
- **SePay (VietQR):** Top-up QR is rendered from `qr.sepay.vn/img` using the configured receiving account and partner tax-code memo (`TOPUP {taxCode}`). Incoming SePay webhooks hit `/api/v1/webhooks/sepay`, verify API key, dedupe by SePay transaction ID, match partner by tax code, enforce `SEPAY_MIN_TOPUP_VND` (default 10m VND), then atomically write `sepay_webhook_events` + `ledger_entries.partner_topup` + partner balance. Driver and garage payouts are manual bank transfers: admin approves the withdrawal, transfers externally, then marks the record paid.
- **Driver invoices:** `driver_invoices.invoice_html` stores the printable HTML snapshot. Admin `/admin/invoices/driver/[id]/print` renders that snapshot for print/export. `admin_approve_driver_withdrawal()` atomically reserves the driver balance and creates a processing payout; `admin_mark_driver_payout_paid()` finalises it only after the external bank transfer succeeds.
- **Withdrawal review UI:** Driver withdrawal requests live in `/admin/invoices/driver`; garage withdrawal requests live in `/admin/invoices/garage`. The Invoices nav badge shows the combined pending/processing request count, while Driver/Garage invoice children show role-specific counts.
- **Partner invoices:** Admin partner invoices are recognized campaign charges from `driver_earning_periods`; wallet top-ups stay in ledger/billing and do not appear as partner invoices.
- **Garage withdrawals:** Approved install proof credits garage balance immediately. Garage withdrawal uses `request_garage_withdrawal()` to lock the garage row, validate payout settings + minimum withdrawal, reserve balance, and create a printable pending request. Garage and admin print routes render the stored HTML invoice. `admin_review_garage_withdrawal()` moves pending → processing → paid or refunds balance on failure.
- **Admin reporting:** Invoice reports aggregate by month: paid driver withdrawals, recognized partner campaign charges, paid garage withdrawals, and net profit. CSV exports use `/api/v1/admin/reports/[type]?month=YYYY-MM`.
- **CCCD KYC:** Manual review at P1. v2 candidates: VNPT eKYC / TrustingSocial.
- **E-invoice:** Deferred. Trigger: nightly cron for partner charges > 200k VND → VNPT/Misa.

## 9. Folder map

```
src/
├── app/{driver,partner,admin,garage,(public),api/v1}/
│   ├── api/v1/admin/reports/[type]/route.ts    Monthly invoice/profit CSV exports
├── components/{ui,driver,partner,admin,garage,shared}/
│   ├── shared/role-*.tsx         shell primitives: role-shell, role-sidebar, role-bottom-nav, role-topbar, role-user-menu
│   ├── shared/{page-header,kpi-card,section-shell,empty-state}.tsx
│   ├── driver/                   driver panel components: driver-nav-config, today-card, kyc-wizard, invoice-list-item, profile forms
│   ├── partner/                  partner panel components (under development)
│   ├── garage/                   garage panel components (under development)
│   └── admin/                    admin panel components: admin-nav-config, data-table, review-drawer, review-content (KYC, creative, photo verif), queue-client (KYC, creatives, install-proofs, photo-verif)
├── lib/{supabase,auth,admin,driver,garage,partner,shared}/
│   └── admin/                    query library (queues, invoices, unified withdrawals, monthly reports), csv-helpers (toCsv, csvResponse)
├── server/{distance,payout,state-machine}/  # server-only, never bundled
├── providers/  hooks/  types/  proxy.ts
```

**Convention:** `x-pathname` header set by `proxy.ts` in middleware allows server layouts to read current pathname without client hooks — used by RoleShell to determine active sidebar/nav item.

## 10. Risks tracked in PDR §7
