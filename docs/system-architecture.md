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
  ↕ MapLibre + OSM tiles (Nominatim geocoding)
  ↕ SePay  (VietQR top-up + payout)
  ↕ Vercel Cron (rollup, prompts, fraud sweep)
```

Monolith rationale: 1 deploy, 1 auth, shared component library. Split only when a module's traffic or release cadence justifies it.

## 2. Data plane

PostGIS enabled. Tables grouped by domain:

| Group        | Tables                                                                                                            |
| ------------ | ----------------------------------------------------------------------------------------------------------------- |
| Identity     | `profiles`, `partners`, `drivers`, `garages`                                                                      |
| Inventory    | `vehicles`                                                                                                        |
| Campaigns    | `campaigns`, `contracts`                                                                                          |
| GPS          | `gps_logs`, `contract_daily_stats` (deferred until mobile/GPS phase)                                              |
| Verification | `photos`, `qr_scans`                                                                                              |
| Money        | `ledger_entries`, `driver_earning_periods`, `driver_invoices`, `payouts`, `sepay_webhook_events`, `pricing_rules` |
| Ops          | `audit_log`                                                                                                       |

Full DDL → `supabase/migrations/0001_schema.sql`. Enums and constraints normalise state and money correctness at the database level.

## 3. Trust boundary

RLS is **deny-by-default**. Every table enables RLS in `0002_rls.sql`. Two writer modes:

- **RLS-scoped client** (`src/lib/supabase/server.ts`, `client.ts`): UI/API on behalf of the signed-in user. Limited to own rows.
- **Service-role client** (`src/lib/supabase/admin.ts`, server-only): Privileged writes — ledger entries, state transitions, payouts. Each callsite enforces its own authz.

Rule: anything touching money goes through a service-role API route/action. Never client → Postgres.

**Admin bypass flag (`ADMIN_PANEL_BYPASS`):** A dev-only env var (explicit opt-in, default false). When set to `"true"`, users whose `profiles.role = 'admin'` may visit `/driver`, `/partner`, and `/garage` routes without being redirected — useful for inspecting role panels during development. The bypass is routing-only and silent: RLS still enforces what data the admin can read/write at the DB level, and all writes continue to carry the admin's real `user_id`. Non-admin users are never affected regardless of flag state. **Critical for production: this flag MUST be unset in deployed environments (env var deleted from Vercel or `.env.local`) — no code change required.**

**Admin security-definer RPCs:** Admin review RPCs in `0010_admin_rpcs.sql` (`approve_driver_kyc`, `approve_campaign`, `set_user_blocked`) and money RPCs in `0014_admin_money_ledger_rpc.sql` / `0016_admin_review_install_proof_rpc.sql` are owned by postgres. Money RPCs check the actor is an active admin, perform ledger/balance/audit writes in one DB transaction, and grant execute only to `service_role`. `is_admin()` also requires `profiles.blocked = false`, so suspended admins lose DB admin-policy access.

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

After a completed monthly period, `ensure_driver_monthly_earning_period()` creates exactly one `driver_earning_periods` row per contract/period. It checks campaign funding mode (`monthly_cap` or `balance_percent`), partner balance, campaign total budget, and optional active driver limit.

Ledger triple per period: `partner_charge` deducts gross campaign charge, `platform_fee` records fee, `driver_accrual` records driver net. Driver net target defaults to 1.1m VND/month after fee.

## 6. Fraud signals (server-side, no client trust)

Current phase: earning gate requires approved profile, assigned campaign, selected garage, garage install proof, and admin decal approval. GPS fraud signals move to mobile/GPS phase.

## 7. Photo verification

Driver PWA / garage panel → compressed image (< 2 MB) → Supabase Storage signed URL → photo finalize → admin queue. Install proof approval is the earning gate.

Garage install proof approval runs through `admin_review_install_proof()`. Approval updates the proof, moves the contract to `running`, sets `earning_start_date`, and if `pricing_rules.install_fee_vnd > 0`, creates one `garage_install_payout` ledger row linked by `contract_id` and `ref_type='install_proof'`. A partial unique index prevents duplicate payouts for the same proof.

## 8. Vietnam stack wiring

- **Auth:** Supabase OAuth (Google + GitHub). No SMS dependency. Role assignment via `choose_role()` RPC post-signup (maps to `auth.users.raw_user_meta_data.role`).
- **SePay (VietQR):** Top-up uses partner UUID as memo → webhook/manual admin RPC → `ledger_entries` credit + partner balance update in one transaction. Payouts: driver creates monthly withdrawal invoice → admin payout row → SePay payout request → webhook/manual action flips status. Idempotency: `sepay_webhook_events.txn_id` unique.
- **Driver invoices:** `driver_invoices.invoice_html` stores the printable HTML snapshot. Admin `/admin/invoices/driver/[id]/print` renders that snapshot for print/export.
- **CCCD KYC:** Manual review at P1. v2 candidates: VNPT eKYC / TrustingSocial.
- **Geocoding & Maps:** MapLibre GL + OpenStreetMap tiles + Nominatim. Used for vehicle location display and garage service-area approximation.
- **E-invoice:** Deferred. Trigger: nightly cron for partner charges > 200k VND → VNPT/Misa.

## 9. Folder map

```
src/
├── app/{driver,partner,admin,garage,(public),api/v1}/
│   ├── api/v1/admin/reports/[type]/route.ts    Dynamic CSV export (drivers, campaigns, invoices, fraud)
├── components/{ui,driver,partner,admin,garage,shared}/
│   ├── shared/role-*.tsx         shell primitives: role-shell, role-sidebar, role-bottom-nav, role-topbar, role-user-menu
│   ├── shared/{page-header,kpi-card,section-shell,empty-state}.tsx
│   ├── driver/                   driver panel components: driver-nav-config, today-card, kyc-wizard, invoice-list-item, profile forms
│   ├── partner/                  partner panel components (under development)
│   ├── garage/                   garage panel components (under development)
│   └── admin/                    admin panel components: admin-nav-config, data-table, review-drawer, review-content (KYC, creative, photo verif), queue-client (KYC, creatives, install-proofs, photo-verif)
├── lib/{supabase,geo,money,photo,qr,sepay,fraud,auth}/
│   └── admin/                    query library (getKycQueue, getCreativesQueue, getPhotoVerifications, getReportsData w/ period), csv-helpers (toCsv, csvResponse)
├── server/{distance,payout,state-machine}/  # server-only, never bundled
├── providers/  hooks/  types/  proxy.ts
```

**Convention:** `x-pathname` header set by `proxy.ts` in middleware allows server layouts to read current pathname without client hooks — used by RoleShell to determine active sidebar/nav item.

## 10. Risks tracked in PDR §7
