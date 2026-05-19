# Code Standards

Enforced via lint + review. Non-negotiable rules first; conventions second.

## Hard rules

1. **Package manager:** pnpm only. `npm` / `yarn` blocked via `preinstall: npx only-allow pnpm`. Commit `pnpm-lock.yaml`; never commit `package-lock.json` / `yarn.lock`. Use `pnpm dlx` (not `npx`) for one-off CLIs.
2. **UI primitives:** shadcn/ui only (Radix + Tailwind + CVA). Add via `pnpm dlx shadcn@latest add <name>`. Customise by editing the copied component in `src/components/ui/*`, not by wrapping. No alternative libraries (MUI, Chakra, Mantine, Ant Design, etc.).
3. **Forms:** shadcn `Form` + `react-hook-form` + `zod` resolver. No bespoke form state.
4. **Toasts:** `sonner`. No alternative toast libraries.
5. **Icons:** `lucide-react`.
6. **Service-role key:** `SUPABASE_SERVICE_ROLE_KEY` server-only. `src/lib/supabase/admin.ts` MUST NOT be imported from a `'use client'` file or any code path that ships to the browser. The file imports `'server-only'` to enforce this at bundle time.
7. **RLS:** Every Supabase table has RLS enabled. Default policy is deny. Add explicit `select` / `insert` / `update` / `delete` policies in `supabase/migrations/000N_rls.sql`. Money / GPS writes go through service-role API routes — never client → Postgres direct.
8. **State transitions:** Never `UPDATE status` directly. Call `transition_campaign` / `transition_contract` RPCs (defined in `0003_functions.sql`). RLS blocks direct writes.
9. **File size:** Keep individual code files under 200 LOC. Split into focused modules; extract utilities to `src/lib/*` or `src/server/*`.
10. **Naming:** kebab-case for `.ts` / `.tsx` (e.g. `role-gate.ts`, `login-form.tsx`). Next.js framework filenames (`page.tsx`, `layout.tsx`, `route.ts`) are mandatory and not subject to this rule. SQL migrations follow Supabase convention `NNNN_name.sql`.
11. **Secrets:** Never commit `.env*` (only `.env.example`). Never log secrets. PII (CCCD, bank account) lives in private storage with signed URLs only.

## Conventions

- **Imports:** Internal aliased via `@/...` (configured in `tsconfig.json`).
- **Components:** Server components by default. Add `'use client'` only when needed (state, effects, browser APIs).
- **Server boundary:** Route handlers and server actions that use the service-role client must explicitly verify the caller's authz before any write.
- **Errors:** Throw at boundaries; let Next.js error boundaries / API handlers convert to user-facing messages. Use `sonner` for UI feedback.
- **Comments:** Prefer self-documenting code. Add a comment when the _why_ is non-obvious (constraint, workaround, surprising behaviour).
- **Commits:** Conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`). No AI references in commit messages.
- **Money:** All currency in `bigint` VND. Never floats. Format via `src/lib/money/format`.
- **Time:** Store UTC. Compute day boundary in `Asia/Saigon` for rollups and payouts.
- **Geo:** Store points as `geography(point,4326)`. Use PostGIS `st_distance` / `st_dwithin`.

## Folder ownership

| Folder              | Purpose                                                 |
| ------------------- | ------------------------------------------------------- |
| `src/app/(role)/`   | UI route groups per role; only role-specific components |
| `src/components/ui` | shadcn primitives (CLI-managed)                         |
| `src/lib`           | Client-or-server safe helpers                           |
| `src/server`        | Server-only logic (never bundled to client)             |
| `supabase/`         | Migrations + seed; the SQL source of truth              |
| `plans/`            | Active and historical implementation plans              |
| `docs/`             | PDR, architecture, standards, roadmap                   |

## Lint & format

- ESLint via `pnpm lint`. Prettier via `pnpm format`. Husky + lint-staged on commit.
- Don't bypass hooks (`--no-verify`) unless explicitly approved. Fix the underlying error.
