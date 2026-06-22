# Vehical Advertise

Vehicle advertising marketplace for the Hanoi pilot. Partners self-onboard, top up their wallet, and create reserved-budget campaigns; admins match campaigns with drivers, vehicles, and garages; garages install decals and upload proof; drivers earn monthly income after admin-checked install proof and create withdrawal invoices.

**Stack:** Next.js 16 (App Router) · Supabase (Postgres + Auth + Storage + Realtime) · shadcn/ui · Tailwind v4 · TanStack Query · pnpm

## Quick start

```bash
pnpm install
cp .env.example .env.local        # fill in Supabase keys + service role
pnpm dev                          # http://localhost:3000
```

## Project layout

```
src/
├── app/
│   ├── (admin)/   sidebar shell, matching/proofs/payouts/pricing/invoices
│   ├── (public)/  landing, email login/signup, QR redirect
│   └── api/v1/    photo finalize, webhooks, cron, transitions
├── lib/
│   ├── supabase/  browser, server (RLS-scoped), admin (service-role, server-only)
│   └── auth/      role-gate helpers
├── proxy.ts       Supabase session refresh + role gate
└── types/db.ts    Generated from Supabase schema
```

See `plans/260513-1149-wheels-earner-day1/architecture.md` for the canonical schema, state machines, and folder map.

## Supabase

Migrations live under `supabase/migrations/`. Apply with the Supabase CLI:

```bash
pnpm dlx supabase link --project-ref <ref>
pnpm dlx supabase db push
pnpm dlx supabase db execute --file supabase/seed.sql

# After schema is live, generate TypeScript types:
pnpm dlx supabase gen types typescript --linked > src/types/db.ts
```

Region: `ap-southeast-1` (Singapore). Extensions: `pgcrypto`. PostGIS was removed after GPS/QR tracking tables were dropped from the current web-only scope.

## Conventions

- **Package manager:** pnpm only (enforced by `npx only-allow pnpm`). Never npm/yarn.
- **UI:** shadcn/ui components in `src/components/ui/*`. Add via `pnpm dlx shadcn@latest add <name>`. No alternative libraries.
- **Service-role key:** `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never import `src/lib/supabase/admin.ts` from a `'use client'` file.
- **RLS:** Deny by default. Every table has explicit policies; money writes go through service-role API routes/actions only.
- **Files:** kebab-case TS/TSX, under 200 LOC per file.

## Documentation

- `docs/project-overview-pdr.md` — product requirements
- `docs/system-architecture.md` — architecture snapshot
- `docs/code-standards.md` — coding rules
- `plans/260513-1149-wheels-earner-day1/` — phase-by-phase plan

## Scripts

| Command       | Purpose                        |
| ------------- | ------------------------------ |
| `pnpm dev`    | Next.js dev server             |
| `pnpm build`  | Production build (type-checks) |
| `pnpm lint`   | ESLint                         |
| `pnpm format` | Prettier write                 |
