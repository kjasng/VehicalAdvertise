# Codebase Summary

**Overview:** Next.js 16 + TypeScript monolith. Supabase (Postgres, Auth, Storage) + MapLibre + SePay. Three role panels (driver PWA, partner web, garage web) + admin panel. RLS-enforced security; GPS pipeline with daily rollup; fraud detection server-side.

## App Routes

| Route         | Purpose                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `/driver`     | Driver PWA — campaign selection, GPS logging, photo verification, earnings dashboard                                                 |
| `/partner`    | Partner web — campaign creation, contract management, driver verification, ledger                                                    |
| `/garage`     | Garage web — vehicle inventory, service-area map, availability toggle, team users                                                    |
| `/admin`      | Admin panel — 11 pages (Dashboard, KYC review, creative review, install proofs, photo verifs, invoices, users, reports, ledger, map) |
| `/(public)`   | Landing, OAuth login (Google + GitHub), QR redirect                                                                                  |
| `/onboarding` | Role selection & CCCD upload (pending users post-signup)                                                                             |
| `/api/v1/*`   | Route handlers — GPS ingest, photo finalize, webhooks (SePay, Supabase), state transitions                                           |

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
| `bypass-banner.tsx`   | Red banner ("Admin viewing as X") — visible when `ADMIN_PANEL_BYPASS=true`  |

## Admin Shared Components

Located in `src/components/admin/`. Support the 11 admin pages.

| Component                     | Purpose                                                                                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `admin-nav-config.ts`         | ADMIN_NAV: 11 sidebar items (Dashboard → Map) with href + label + icon                                                                    |
| `data-table.tsx`              | **Client component.** Generic `<DataTable<T>>` — sticky header, zebra rows, click-to-sort, pencil border colors                           |
| `review-drawer.tsx`           | **Client component.** Slide-in-from-right with backdrop + Escape close, role=dialog a11y                                                  |
| `kyc-review-content.tsx`      | **Client component.** KYC review drawer body — CCCD photos, selfie, approve/reject stubs                                                  |
| `creative-review-content.tsx` | **Client component.** Creative review drawer body — image preview, spec list, stubs                                                       |
| `invoice-filters.tsx`         | **Client component.** Date range + status select + search; lifted state via callback                                                      |
| `invoice-table.tsx`           | **Client component.** InvoiceFilters + DataTable combined with client-side filter logic                                                   |
| `weekly-km-chart.tsx`         | **Client component.** Recharts line chart, 12-week mock data                                                                              |
| `demo-badge.tsx`              | Inline "DEMO" label; renders only when `NODE_ENV !== 'production'`                                                                        |
| `mock-data.ts`                | Single source of truth — mock rows for all 10 pages (KYC, Creatives, Install Proofs, Photo Verifs, 3× Invoices, Users, Ledger, Weekly KM) |

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
3. **Mock data isolation:** Phase 03 uses `mock-data.ts` — single import per admin page. Swap to real Supabase queries in Phase 07+.
4. **Server/client boundary:** Layouts + dashboards are server components. Only state/event handlers use `'use client'`.
5. **Stubs marked:** All unimplemented approve/reject/suspend handlers tagged `[STUB]` in console; real RPC calls target Phase 07+.
