# Codebase Summary

**Overview:** Next.js 16 + TypeScript monolith. Supabase (Postgres, Auth, Storage) + MapLibre + SePay. Four role panels (driver, partner, garage, admin) with shared shell architecture (sidebar + multi-page layout). RLS-enforced security; GPS pipeline with daily rollup; fraud detection server-side.

## App Routes

| Route                                | Purpose                                                                                                               |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `/driver`                            | Driver panel — dashboard (today stats, weekly KM chart), KYC verification, weekly invoices, profile & sign-out        |
| `/partner`                           | Partner web — campaign creation, contract management, driver verification, ledger                                     |
| `/garage`                            | Garage web — vehicle inventory, service-area map, availability toggle, team users                                     |
| `/admin`                             | Admin panel — dashboard, verification queues, contracts, money ops, pricing, invoices, users, reports, audit log, map |
| `/(public)`                          | Landing, OAuth login (Google + GitHub), QR redirect                                                                   |
| `/onboarding`                        | Role selection & CCCD upload (pending users post-signup)                                                              |
| `/api/v1/*`                          | Route handlers — GPS ingest, photo finalize, webhooks (SePay, Supabase), state transitions                            |
| `/api/v1/admin/reports/[type]` (GET) | CSV export (drivers, campaigns, invoices, fraud); admin-auth guarded                                                  |

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

| Component                        | Purpose                                                                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `admin-nav-config.ts`            | ADMIN_NAV: sidebar groups/items (Dashboard → Map) with href + label + icon                                      |
| `data-table.tsx`                 | **Client component.** Generic `<DataTable<T>>` — sticky header, zebra rows, click-to-sort, pencil border colors |
| `review-drawer.tsx`              | **Client component.** Slide-in-from-right with backdrop + Escape close, role=dialog a11y                        |
| `kyc-review-content.tsx`         | **Client component.** KYC review drawer body — CCCD photos, selfie, approve/reject actions                      |
| `creative-review-content.tsx`    | **Client component.** Creative review drawer body — image preview, spec list, approve/reject actions            |
| `photo-verif-review-content.tsx` | **Client component.** Photo verification drawer body — verify image, approve/reject with reason                 |
| `invoice-filters.tsx`            | **Client component.** Date range + search; lifted state via callback                                            |
| `invoice-table.tsx`              | **Client component.** InvoiceFilters + DataTable with real invoice rows and client-side filtering               |
| `weekly-km-chart.tsx`            | **Client component.** Recharts line chart accepting real data prop from dashboard                               |
| `demo-badge.tsx`                 | Inline "DEMO" label; renders only when `NODE_ENV !== 'production'`                                              |
| `kyc-queue-client.tsx`           | **Client component.** Drawer + DataTable for KYC queue; handles row selection and reviewer actions              |
| `creatives-queue-client.tsx`     | **Client component.** Drawer + DataTable for creatives review; handles approval workflow                        |
| `install-proofs-client.tsx`      | **Client component.** Drawer + DataTable for installation proofs; multi-image gallery + proof verification      |
| `photo-verif-queue-client.tsx`   | **Client component.** Drawer + DataTable for photo verification queue; interactive review + rejection handling  |
| `pricing-settings-client.tsx`    | **Client component.** Role-grouped pricing settings for garage, partner, and driver money rules                 |
| `contracts-client.tsx`           | **Client component.** Campaign contract matching with contract type, status, and party search filters           |
| `payouts-client.tsx`             | **Client component.** Driver pending balances and payout history with user search plus month/quarter filters    |
| `users-table-client.tsx`         | **Client component.** DataTable with search params (?q=) for user filtering and status management               |
| `mock-data.ts`                   | Reference data (not imported in any page; used only for component development and tests)                        |

## Admin Query Library

Located in `src/lib/admin/`. Server-side query helpers for dashboard, review queues, and reporting.

| Query                         | Purpose                                                                    |
| ----------------------------- | -------------------------------------------------------------------------- |
| `getDashboardStats`           | KPIs for admin dashboard (users, revenue, active drivers)                  |
| `getKycQueue`                 | Pending KYC reviews with profile + document URLs                           |
| `getCreativesQueue`           | Campaign creatives awaiting approval                                       |
| `getInstallProofs`            | Installation verification submissions                                      |
| `getPhotoVerifications`       | Photo verification queue                                                   |
| `getDriverInvoices`           | Driver invoice ledger filtered by period                                   |
| `getPartnerInvoices`          | Partner invoice ledger filtered by period                                  |
| `getGarageInvoices`           | Garage invoice ledger filtered by period                                   |
| `getPricingSettings`          | Current role pricing rule for garage payout, partner cap, and driver rates |
| `getRecentAdjustments`        | Recent manual `adjustment` / `refund` ledger entries                       |
| `getLedgerTargets`            | Partner + driver target list for admin ledger adjustments                  |
| `getUsers`                    | Users list with role + status filtering                                    |
| `getReportsData(period)`      | Fraud/performance reports grouped by week/month/year with period range     |
| `periodRange(period)`         | Helper — returns [startDate, endDate] for week/month/prev_month/year       |
| `groupByPeriod(rows, period)` | Helper — buckets daily stats into period labels (week/month/year)          |
| `getActiveGpsTrails`          | Live GPS traces for map view                                               |

## Admin Utilities

CSV export and report helpers in `src/lib/admin/`.

| Module           | Purpose                                                                     |
| ---------------- | --------------------------------------------------------------------------- |
| `csv-helpers.ts` | `toCsv()` (RFC 4180 + formula injection defense), `csvResponse()` (headers) |

## Driver Shared Components

Located in `src/components/driver/`. Support the driver panel (dashboard, KYC, invoices, profile).

| Component                         | Purpose                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------ |
| `driver-nav-config.ts`            | DRIVER_NAV: 4 sidebar items (Dashboard, Verify, Invoice, Profile) with href + label + icon |
| `today-card.tsx`                  | Dark SectionShell — km numeral (Anton 72px), earnings, campaign badge, "Go online" CTA     |
| `weekly-km-chart.tsx`             | Recharts AreaChart, 7-day mock data, primary fill + stroke                                 |
| `kyc-wizard.tsx`                  | 3-step state machine, StepIndicator, FileInput w/ camera capture, sonner toast stub        |
| `invoice-list-item.tsx`           | Expand/collapse `<details>` — status pill, day breakdown table                             |
| `profile-vehicle-photo-input.tsx` | Isolated client component for camera file input (extracted to keep profile page ≤200)      |
| `mock-data.ts`                    | TodayStats, DailyKmPoint, VerificationPrompt, DriverInvoiceRow — VN realistic data         |

## Partner Shared Components

Located in `src/components/partner/`. Support the partner panel (campaigns, contracts, verification, ledger).

| Component                          | Purpose                                                                                |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| `partner-nav-config.ts`            | PARTNER_NAV: sidebar items for partner workflows (Campaigns, Drivers, Reports, Ledger) |
| _[to be added as phases continue]_ | Partner-specific forms, charts, and review components                                  |

## Garage Shared Components

Located in `src/components/garage/`. Support the garage panel (inventory, service area, team users).

| Component                          | Purpose                                                                                |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| `garage-nav-config.ts`             | GARAGE_NAV: sidebar items for garage workflows (Vehicles, Service Area, Team, Reports) |
| _[to be added as phases continue]_ | Garage-specific maps, inventory, and team management components                        |

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
2. **File size:** All code files ≤ 200 lines; largest is `mock-data.ts` (179 LOC).
3. **Real data wiring:** All admin pages fetch via `src/lib/admin/` query library (getKycQueue, getCreativesQueue, getInstallProofs, etc.). Mock-data.ts retained for reference only.
4. **Server/client boundary:** Pages are server components that fetch data; client wrapper components (e.g., kyc-queue-client) handle interactivity (drawers, state, actions).
5. **Action handlers:** Approve/reject/suspend now call real server actions (reviewDriverKyc, reviewCampaign, etc.) wired to Supabase security-definer RPCs.
