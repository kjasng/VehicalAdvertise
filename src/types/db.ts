/**
 * Placeholder Database types.
 *
 * Replace by running, after Supabase project link:
 *   pnpm dlx supabase gen types typescript --linked > src/types/db.ts
 *
 * Until the schema is generated, callers can use Supabase clients without
 * specifying a generic; that keeps the build green at the cost of `any`.
 */

export type Database = {
  // Generated types go here. Kept intentionally empty so `createClient<Database>()`
  // still compiles before the CLI is wired up.
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type UserRole = 'driver' | 'partner' | 'admin' | 'garage'
