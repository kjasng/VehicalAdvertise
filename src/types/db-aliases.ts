/**
 * Hand-rolled enum aliases. Kept in a SEPARATE file (not db.ts) so that
 * `supabase gen types ... > src/types/db.ts` regeneration never wipes them.
 * Import these from '@/types/db-aliases' instead of '@/types/db'.
 */
import type { Database } from './db'

export type UserRole = Database['public']['Enums']['user_role']
export type KycStatus = Database['public']['Enums']['kyc_status']
export type PartnerStatus = Database['public']['Enums']['partner_status']
export type CampaignStatus = Database['public']['Enums']['campaign_status']
export type ContractStatus = Database['public']['Enums']['contract_status']
