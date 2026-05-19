/**
 * Placeholder Database types.
 *
 * Replace by running, after Supabase project link:
 *   pnpm dlx supabase gen types typescript --linked > src/types/db.ts
 *
 * Until the schema is generated, callers can use Supabase clients without
 * specifying a generic; that keeps the build green at the cost of `any`.
 */

export type UserRole = 'pending' | 'driver' | 'partner' | 'admin' | 'garage'

type ProfilesRow = {
  id: string
  role: UserRole
  full_name: string
  phone_e164: string | null
  email: string | null
}

type ContractsRow = {
  id: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfilesRow
        Insert: Partial<ProfilesRow> & { id: string }
        Update: Partial<ProfilesRow>
      }
      contracts: {
        Row: ContractsRow
        Insert: ContractsRow
        Update: Partial<ContractsRow>
      }
    }
    Views: Record<string, never>
    Functions: {
      choose_role: {
        Args: { target: UserRole }
        Returns: ProfilesRow
      }
    }
    Enums: { user_role: UserRole }
    CompositeTypes: Record<string, never>
  }
}
