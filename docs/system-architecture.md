# System Architecture

Authoritative source: `plans/260513-1149-wheels-earner-day1/architecture.md`. This file is the docs-folder mirror — updated whenever the canonical plan changes.

## 1. Topology

```
Next.js 16 monolith (one deploy, route groups per role)
  /(driver) PWA   /(partner) web   /(admin) web   /(garage) web
  /api/v1/*       Route Handlers (GPS, photos, webhooks, payouts, transitions)
  /(public)/      landing, login (phone OTP), QR redirect
  proxy.ts        Supabase session refresh + role gate

  ↕ Supabase (Postgres + Auth + Storage + Realtime + Edge fns)
  ↕ SePay  (VietQR top-up + payout)
  ↕ Vercel Cron (rollup, prompts, fraud sweep)
```

Monolith rationale: 1 deploy, 1 auth, shared component library. Split only when a module's traffic or release cadence justifies it.

## 2. Data plane

PostGIS enabled. Tables grouped by domain:

| Group        | Tables                                                               |
| ------------ | -------------------------------------------------------------------- |
| Identity     | `profiles`, `partners`, `drivers`, `garages`                         |
| Inventory    | `vehicles`                                                           |
| Campaigns    | `campaigns`, `contracts`                                             |
| GPS          | `gps_logs`, `contract_daily_stats`                                   |
| Verification | `photos`, `qr_scans`                                                 |
| Money        | `ledger_entries`, `payouts`, `sepay_webhook_events`, `pricing_rules` |
| Ops          | `audit_log`                                                          |

Full DDL → `supabase/migrations/0001_schema.sql`. Enums and constraints normalise state and money correctness at the database level.

## 3. Trust boundary

RLS is **deny-by-default**. Every table enables RLS in `0002_rls.sql`. Two writer modes:

- **RLS-scoped client** (`src/lib/supabase/server.ts`, `client.ts`): UI/API on behalf of the signed-in user. Limited to own rows.
- **Service-role client** (`src/lib/supabase/admin.ts`, server-only): Privileged writes — GPS ingest, ledger entries, state transitions, payouts. Each callsite enforces its own authz.

Rule: anything touching money or GPS goes through a service-role API route. Never client → Postgres.

## 4. State machines

```
campaign : draft → submitted → approved → awaiting_install → active → completed
                              ↘ rejected            active ↔ paused / cancelled
contract : matched → awaiting_install → installed → running → completed
                                                     ↘ disputed / terminated
```

Both enforced by `assert_transition(entity, from, to)` in `0003_functions.sql`, called from RPCs `transition_campaign` / `transition_contract`. UI cannot UPDATE status directly (RLS blocks).

## 5. GPS pipeline (high-level)

Client: 1 fix/5s foreground, drop accuracy > 50 m, batch 6 → POST every 30 s, queue offline.

Server (`POST /api/v1/gps/ingest`): verify session + contract running → dedupe `(contract_id, client_seq)` → fraud rules → insert valid rows → publish to Realtime `contract:{id}`.

Daily rollup at 00:15 Asia/Saigon: PostGIS distance with teleport / speed / gap filters → `contract_daily_stats` → ledger triple (`partner_charge` + `driver_accrual` + `platform_fee`).

Earnings formula: `min(km_valid, daily_cap_km) × rate_per_km_vnd × (fuel='electric' ? ev_multiplier : 1.0)`.

## 6. Fraud signals (server-side, no client trust)

speed > 130 km/h · teleport (> 500 m gap < 120 s) · accuracy_m > 50 · daily cap breach · stationary > 30 min during paid window · permission flip · IP country ≠ VN · device fingerprint change · missed photo prompt · EXIF GPS / time mismatch.

## 7. Photo verification

Driver PWA → `browser-image-compression` (< 2 MB) → Supabase Storage signed URL → `POST /api/v1/photos/finalize` → EXIF parse → cross-check vs last GPS fix (± 300 m) and server time (< 3 min) → auto-reject or admin queue. Effects: photo approved → day's accrual released; 3 rejects / 7 days → driver auto-suspend.

## 8. Vietnam stack wiring

- **Phone + OTP:** Supabase auth + eSMS.vn (primary) / VHT-Stringee (failover). 5-min TTL, 3/hour per phone. P0 uses Supabase default sandbox.
- **SePay (VietQR):** Top-up uses partner UUID as memo → webhook → `ledger_entries` credit. Payouts: weekly cron → `payouts` row → SePay payout request → webhook flips status. Idempotency: `sepay_webhook_events.txn_id` unique.
- **CCCD KYC:** Manual review at P1. v2 candidates: VNPT eKYC / TrustingSocial.
- **E-invoice:** Deferred. Trigger: nightly cron for partner charges > 200k VND → VNPT/Misa.

## 9. Folder map

```
src/
├── app/{(driver),(partner),(admin),(garage),(public),api/v1}/
├── components/{ui,driver,partner,admin,garage,shared}/
├── lib/{supabase,geo,money,photo,qr,sepay,fraud,auth}/
├── server/{distance,payout,state-machine}/  # server-only, never bundled
├── providers/  hooks/  types/  proxy.ts
```

## 10. Risks tracked in PDR §7
