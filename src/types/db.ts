export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      campaigns: {
        Row: {
          active_driver_limit: number | null
          balance_percent: number | null
          brief: string | null
          budget_vnd: number
          created_at: string
          creative_url: string | null
          creative_urls: string[]
          daily_cap_km: number
          driver_net_monthly_vnd: number
          end_date: string
          ev_multiplier: number
          funding_mode: string
          id: string
          monthly_budget_vnd: number | null
          name: string
          partner_id: string
          platform_fee_pct: number
          qr_target_url: string
          rate_per_km_vnd: number
          reject_reason: string | null
          requested_driver_count: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          spent_vnd: number
          start_date: string
          status: Database['public']['Enums']['campaign_status']
          target_districts: string[] | null
          target_vehicle_types: Database['public']['Enums']['vehicle_fuel'][] | null
        }
        Insert: {
          active_driver_limit?: number | null
          balance_percent?: number | null
          brief?: string | null
          budget_vnd: number
          created_at?: string
          creative_url?: string | null
          creative_urls?: string[]
          daily_cap_km?: number
          driver_net_monthly_vnd?: number
          end_date: string
          ev_multiplier?: number
          funding_mode?: string
          id?: string
          monthly_budget_vnd?: number | null
          name: string
          partner_id: string
          platform_fee_pct?: number
          qr_target_url: string
          rate_per_km_vnd: number
          reject_reason?: string | null
          requested_driver_count?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          spent_vnd?: number
          start_date: string
          status?: Database['public']['Enums']['campaign_status']
          target_districts?: string[] | null
          target_vehicle_types?: Database['public']['Enums']['vehicle_fuel'][] | null
        }
        Update: {
          active_driver_limit?: number | null
          balance_percent?: number | null
          brief?: string | null
          budget_vnd?: number
          created_at?: string
          creative_url?: string | null
          creative_urls?: string[]
          daily_cap_km?: number
          driver_net_monthly_vnd?: number
          end_date?: string
          ev_multiplier?: number
          funding_mode?: string
          id?: string
          monthly_budget_vnd?: number | null
          name?: string
          partner_id?: string
          platform_fee_pct?: number
          qr_target_url?: string
          rate_per_km_vnd?: number
          reject_reason?: string | null
          requested_driver_count?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          spent_vnd?: number
          start_date?: string
          status?: Database['public']['Enums']['campaign_status']
          target_districts?: string[] | null
          target_vehicle_types?: Database['public']['Enums']['vehicle_fuel'][] | null
        }
        Relationships: [
          {
            foreignKeyName: 'campaigns_partner_id_fkey'
            columns: ['partner_id']
            isOneToOne: false
            referencedRelation: 'partners'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'campaigns_reviewed_by_fkey'
            columns: ['reviewed_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      contracts: {
        Row: {
          campaign_id: string
          created_at: string
          driver_id: string
          earned_vnd: number
          earning_approved_at: string | null
          earning_approved_by: string | null
          earning_start_date: string | null
          garage_selected_at: string | null
          id: string
          install_garage_id: string | null
          install_note: string | null
          installed_at: string | null
          km_total: number
          removed_at: string | null
          status: Database['public']['Enums']['contract_status']
          vehicle_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          driver_id: string
          earned_vnd?: number
          earning_approved_at?: string | null
          earning_approved_by?: string | null
          earning_start_date?: string | null
          garage_selected_at?: string | null
          id?: string
          install_garage_id?: string | null
          install_note?: string | null
          installed_at?: string | null
          km_total?: number
          removed_at?: string | null
          status?: Database['public']['Enums']['contract_status']
          vehicle_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          driver_id?: string
          earned_vnd?: number
          earning_approved_at?: string | null
          earning_approved_by?: string | null
          earning_start_date?: string | null
          garage_selected_at?: string | null
          id?: string
          install_garage_id?: string | null
          install_note?: string | null
          installed_at?: string | null
          km_total?: number
          removed_at?: string | null
          status?: Database['public']['Enums']['contract_status']
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'contracts_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contracts_driver_id_fkey'
            columns: ['driver_id']
            isOneToOne: false
            referencedRelation: 'drivers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contracts_earning_approved_by_fkey'
            columns: ['earning_approved_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contracts_install_garage_id_fkey'
            columns: ['install_garage_id']
            isOneToOne: false
            referencedRelation: 'garages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contracts_vehicle_id_fkey'
            columns: ['vehicle_id']
            isOneToOne: false
            referencedRelation: 'vehicles'
            referencedColumns: ['id']
          },
        ]
      }
      driver_earning_periods: {
        Row: {
          campaign_id: string
          contract_id: string
          created_at: string
          driver_id: string
          driver_net_vnd: number
          gross_charge_vnd: number
          id: string
          period_end: string
          period_start: string
          platform_fee_vnd: number
          status: string
        }
        Insert: {
          campaign_id: string
          contract_id: string
          created_at?: string
          driver_id: string
          driver_net_vnd: number
          gross_charge_vnd: number
          id?: string
          period_end: string
          period_start: string
          platform_fee_vnd: number
          status?: string
        }
        Update: {
          campaign_id?: string
          contract_id?: string
          created_at?: string
          driver_id?: string
          driver_net_vnd?: number
          gross_charge_vnd?: number
          id?: string
          period_end?: string
          period_start?: string
          platform_fee_vnd?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: 'driver_earning_periods_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'driver_earning_periods_contract_id_fkey'
            columns: ['contract_id']
            isOneToOne: false
            referencedRelation: 'contracts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'driver_earning_periods_driver_id_fkey'
            columns: ['driver_id']
            isOneToOne: false
            referencedRelation: 'drivers'
            referencedColumns: ['id']
          },
        ]
      }
      driver_invoices: {
        Row: {
          amount_vnd: number
          bank_snapshot: Json
          campaign_id: string
          contract_id: string
          created_at: string
          driver_id: string
          earning_period_id: string
          id: string
          invoice_html: string
          invoice_number: string
          paid_at: string | null
          payout_id: string | null
          period_end: string
          period_start: string
          reject_reason: string | null
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database['public']['Enums']['driver_invoice_status']
        }
        Insert: {
          amount_vnd: number
          bank_snapshot?: Json
          campaign_id: string
          contract_id: string
          created_at?: string
          driver_id: string
          earning_period_id: string
          id?: string
          invoice_html: string
          invoice_number: string
          paid_at?: string | null
          payout_id?: string | null
          period_end: string
          period_start: string
          reject_reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database['public']['Enums']['driver_invoice_status']
        }
        Update: {
          amount_vnd?: number
          bank_snapshot?: Json
          campaign_id?: string
          contract_id?: string
          created_at?: string
          driver_id?: string
          earning_period_id?: string
          id?: string
          invoice_html?: string
          invoice_number?: string
          paid_at?: string | null
          payout_id?: string | null
          period_end?: string
          period_start?: string
          reject_reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database['public']['Enums']['driver_invoice_status']
        }
        Relationships: [
          {
            foreignKeyName: 'driver_invoices_campaign_id_fkey'
            columns: ['campaign_id']
            isOneToOne: false
            referencedRelation: 'campaigns'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'driver_invoices_contract_id_fkey'
            columns: ['contract_id']
            isOneToOne: false
            referencedRelation: 'contracts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'driver_invoices_driver_id_fkey'
            columns: ['driver_id']
            isOneToOne: false
            referencedRelation: 'drivers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'driver_invoices_earning_period_id_fkey'
            columns: ['earning_period_id']
            isOneToOne: false
            referencedRelation: 'driver_earning_periods'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'driver_invoices_payout_id_fkey'
            columns: ['payout_id']
            isOneToOne: false
            referencedRelation: 'payouts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'driver_invoices_reviewed_by_fkey'
            columns: ['reviewed_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      drivers: {
        Row: {
          bank_account_name: string | null
          bank_account_number: string | null
          bank_bin: string | null
          bank_branch: string | null
          bank_name: string | null
          bank_verified_at: string | null
          body_type: string | null
          cccd_number: string | null
          id: string
          operating_districts: string[] | null
          primary_city: string
          rating: number | null
        }
        Insert: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_bin?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          bank_verified_at?: string | null
          body_type?: string | null
          cccd_number?: string | null
          id: string
          operating_districts?: string[] | null
          primary_city?: string
          rating?: number | null
        }
        Update: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_bin?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          bank_verified_at?: string | null
          body_type?: string | null
          cccd_number?: string | null
          id?: string
          operating_districts?: string[] | null
          primary_city?: string
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'drivers_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      garage_earnings: {
        Row: {
          amount_vnd: number
          approved_at: string
          approved_by: string | null
          contract_id: string
          created_at: string
          garage_id: string
          id: string
          photo_id: string | null
          source: string
        }
        Insert: {
          amount_vnd: number
          approved_at?: string
          approved_by?: string | null
          contract_id: string
          created_at?: string
          garage_id: string
          id?: string
          photo_id?: string | null
          source?: string
        }
        Update: {
          amount_vnd?: number
          approved_at?: string
          approved_by?: string | null
          contract_id?: string
          created_at?: string
          garage_id?: string
          id?: string
          photo_id?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: 'garage_earnings_approved_by_fkey'
            columns: ['approved_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'garage_earnings_contract_id_fkey'
            columns: ['contract_id']
            isOneToOne: true
            referencedRelation: 'contracts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'garage_earnings_garage_id_fkey'
            columns: ['garage_id']
            isOneToOne: false
            referencedRelation: 'garages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'garage_earnings_photo_id_fkey'
            columns: ['photo_id']
            isOneToOne: false
            referencedRelation: 'photos'
            referencedColumns: ['id']
          },
        ]
      }
      garage_withdrawals: {
        Row: {
          amount_vnd: number
          bank_snapshot: Json
          created_at: string
          failure_reason: string | null
          garage_id: string
          id: string
          invoice_html: string
          paid_at: string | null
          requested_at: string
          status: Database['public']['Enums']['payout_status']
          withdrawal_number: string
        }
        Insert: {
          amount_vnd: number
          bank_snapshot?: Json
          created_at?: string
          failure_reason?: string | null
          garage_id: string
          id?: string
          invoice_html: string
          paid_at?: string | null
          requested_at?: string
          status?: Database['public']['Enums']['payout_status']
          withdrawal_number: string
        }
        Update: {
          amount_vnd?: number
          bank_snapshot?: Json
          created_at?: string
          failure_reason?: string | null
          garage_id?: string
          id?: string
          invoice_html?: string
          paid_at?: string | null
          requested_at?: string
          status?: Database['public']['Enums']['payout_status']
          withdrawal_number?: string
        }
        Relationships: [
          {
            foreignKeyName: 'garage_withdrawals_garage_id_fkey'
            columns: ['garage_id']
            isOneToOne: false
            referencedRelation: 'garages'
            referencedColumns: ['id']
          },
        ]
      }
      garages: {
        Row: {
          address: string
          approved: boolean
          balance_vnd: number
          bank_account_name: string | null
          bank_account_number: string | null
          bank_bin: string | null
          bank_branch: string | null
          bank_name: string | null
          bank_verified_at: string | null
          contact_name: string | null
          google_maps_url: string | null
          id: string
          lat: number | null
          lng: number | null
          phone: string | null
          rating: number | null
          service_area: string | null
          shop_name: string
          working_hours: string | null
        }
        Insert: {
          address: string
          approved?: boolean
          balance_vnd?: number
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_bin?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          bank_verified_at?: string | null
          contact_name?: string | null
          google_maps_url?: string | null
          id: string
          lat?: number | null
          lng?: number | null
          phone?: string | null
          rating?: number | null
          service_area?: string | null
          shop_name: string
          working_hours?: string | null
        }
        Update: {
          address?: string
          approved?: boolean
          balance_vnd?: number
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_bin?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          bank_verified_at?: string | null
          contact_name?: string | null
          google_maps_url?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          phone?: string | null
          rating?: number | null
          service_area?: string | null
          shop_name?: string
          working_hours?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'garages_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      ledger_entries: {
        Row: {
          amount_vnd: number
          contract_id: string | null
          driver_id: string | null
          id: number
          kind: Database['public']['Enums']['ledger_kind']
          note: string | null
          partner_id: string | null
          ref_id: string | null
          ref_type: string | null
          ts: string
        }
        Insert: {
          amount_vnd: number
          contract_id?: string | null
          driver_id?: string | null
          id?: number
          kind: Database['public']['Enums']['ledger_kind']
          note?: string | null
          partner_id?: string | null
          ref_id?: string | null
          ref_type?: string | null
          ts?: string
        }
        Update: {
          amount_vnd?: number
          contract_id?: string | null
          driver_id?: string | null
          id?: number
          kind?: Database['public']['Enums']['ledger_kind']
          note?: string | null
          partner_id?: string | null
          ref_id?: string | null
          ref_type?: string | null
          ts?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ledger_entries_contract_id_fkey'
            columns: ['contract_id']
            isOneToOne: false
            referencedRelation: 'contracts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ledger_entries_driver_id_fkey'
            columns: ['driver_id']
            isOneToOne: false
            referencedRelation: 'drivers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'ledger_entries_partner_id_fkey'
            columns: ['partner_id']
            isOneToOne: false
            referencedRelation: 'partners'
            referencedColumns: ['id']
          },
        ]
      }
      partners: {
        Row: {
          approved_at: string | null
          balance_vnd: number
          billing_address: string | null
          company_name: string
          id: string
          reject_reason: string | null
          status: Database['public']['Enums']['partner_status']
          tax_code: string | null
        }
        Insert: {
          approved_at?: string | null
          balance_vnd?: number
          billing_address?: string | null
          company_name: string
          id: string
          reject_reason?: string | null
          status?: Database['public']['Enums']['partner_status']
          tax_code?: string | null
        }
        Update: {
          approved_at?: string | null
          balance_vnd?: number
          billing_address?: string | null
          company_name?: string
          id?: string
          reject_reason?: string | null
          status?: Database['public']['Enums']['partner_status']
          tax_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'partners_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      payouts: {
        Row: {
          amount_vnd: number
          created_at: string
          driver_id: string
          failure_reason: string | null
          id: string
          paid_at: string | null
          period_end: string
          period_start: string
          sepay_qr_url: string | null
          status: Database['public']['Enums']['payout_status']
        }
        Insert: {
          amount_vnd: number
          created_at?: string
          driver_id: string
          failure_reason?: string | null
          id?: string
          paid_at?: string | null
          period_end: string
          period_start: string
          sepay_qr_url?: string | null
          status?: Database['public']['Enums']['payout_status']
        }
        Update: {
          amount_vnd?: number
          created_at?: string
          driver_id?: string
          failure_reason?: string | null
          id?: string
          paid_at?: string | null
          period_end?: string
          period_start?: string
          sepay_qr_url?: string | null
          status?: Database['public']['Enums']['payout_status']
        }
        Relationships: [
          {
            foreignKeyName: 'payouts_driver_id_fkey'
            columns: ['driver_id']
            isOneToOne: false
            referencedRelation: 'drivers'
            referencedColumns: ['id']
          },
        ]
      }
      photos: {
        Row: {
          client_lat: number | null
          client_lng: number | null
          client_ts: string | null
          created_at: string
          exif_lat: number | null
          exif_lng: number | null
          exif_taken_at: string | null
          id: string
          kind: Database['public']['Enums']['photo_kind']
          reject_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database['public']['Enums']['photo_status']
          storage_path: string
          subject_id: string
          subject_type: string
        }
        Insert: {
          client_lat?: number | null
          client_lng?: number | null
          client_ts?: string | null
          created_at?: string
          exif_lat?: number | null
          exif_lng?: number | null
          exif_taken_at?: string | null
          id?: string
          kind: Database['public']['Enums']['photo_kind']
          reject_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database['public']['Enums']['photo_status']
          storage_path: string
          subject_id: string
          subject_type: string
        }
        Update: {
          client_lat?: number | null
          client_lng?: number | null
          client_ts?: string | null
          created_at?: string
          exif_lat?: number | null
          exif_lng?: number | null
          exif_taken_at?: string | null
          id?: string
          kind?: Database['public']['Enums']['photo_kind']
          reject_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database['public']['Enums']['photo_status']
          storage_path?: string
          subject_id?: string
          subject_type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'photos_reviewed_by_fkey'
            columns: ['reviewed_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      pricing_rules: {
        Row: {
          base_rate_per_km_vnd: number
          created_at: string
          created_by: string | null
          daily_cap_km: number
          effective_from: string
          ev_multiplier: number
          garage_minimum_withdrawal_vnd: number
          id: string
          install_fee_vnd: number
          minimum_daily_km: number
          partner_minimum_cap_vnd: number
          platform_fee_pct: number
        }
        Insert: {
          base_rate_per_km_vnd: number
          created_at?: string
          created_by?: string | null
          daily_cap_km: number
          effective_from: string
          ev_multiplier: number
          garage_minimum_withdrawal_vnd?: number
          id?: string
          install_fee_vnd?: number
          minimum_daily_km?: number
          partner_minimum_cap_vnd?: number
          platform_fee_pct: number
        }
        Update: {
          base_rate_per_km_vnd?: number
          created_at?: string
          created_by?: string | null
          daily_cap_km?: number
          effective_from?: string
          ev_multiplier?: number
          garage_minimum_withdrawal_vnd?: number
          id?: string
          install_fee_vnd?: number
          minimum_daily_km?: number
          partner_minimum_cap_vnd?: number
          platform_fee_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: 'pricing_rules_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          blocked: boolean
          created_at: string
          email: string | null
          full_name: string
          id: string
          kyc_reviewed_at: string | null
          kyc_reviewed_by: string | null
          kyc_status: Database['public']['Enums']['kyc_status']
          phone_e164: string | null
          role: Database['public']['Enums']['user_role']
        }
        Insert: {
          blocked?: boolean
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          kyc_reviewed_at?: string | null
          kyc_reviewed_by?: string | null
          kyc_status?: Database['public']['Enums']['kyc_status']
          phone_e164?: string | null
          role?: Database['public']['Enums']['user_role']
        }
        Update: {
          blocked?: boolean
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          kyc_reviewed_at?: string | null
          kyc_reviewed_by?: string | null
          kyc_status?: Database['public']['Enums']['kyc_status']
          phone_e164?: string | null
          role?: Database['public']['Enums']['user_role']
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_kyc_reviewed_by_fkey'
            columns: ['kyc_reviewed_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      sepay_webhook_events: {
        Row: {
          error: string | null
          id: number
          payload: Json
          processed_at: string | null
          received_at: string
          txn_id: string
        }
        Insert: {
          error?: string | null
          id?: number
          payload: Json
          processed_at?: string | null
          received_at?: string
          txn_id: string
        }
        Update: {
          error?: string | null
          id?: number
          payload?: Json
          processed_at?: string | null
          received_at?: string
          txn_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          approved: boolean
          approved_at: string | null
          approved_by: string | null
          brand: string | null
          driver_id: string
          fuel: Database['public']['Enums']['vehicle_fuel']
          id: string
          model: string | null
          plate: string
          registration_doc_url: string | null
          year: number | null
        }
        Insert: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          brand?: string | null
          driver_id: string
          fuel: Database['public']['Enums']['vehicle_fuel']
          id?: string
          model?: string | null
          plate: string
          registration_doc_url?: string | null
          year?: number | null
        }
        Update: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          brand?: string | null
          driver_id?: string
          fuel?: Database['public']['Enums']['vehicle_fuel']
          id?: string
          model?: string | null
          plate?: string
          registration_doc_url?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'vehicles_approved_by_fkey'
            columns: ['approved_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'vehicles_driver_id_fkey'
            columns: ['driver_id']
            isOneToOne: false
            referencedRelation: 'drivers'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_approve_driver_withdrawal: {
        Args: { p_actor_id: string; p_invoice_id: string }
        Returns: string
      }
      admin_create_money_ledger_entry: {
        Args: {
          p_actor_id: string
          p_amount_vnd: number
          p_kind: Database['public']['Enums']['ledger_kind']
          p_note: string
          p_ref_type?: string
          p_target_id: string
          p_target_type: string
        }
        Returns: number
      }
      admin_mark_driver_payout_paid: {
        Args: { p_actor_id: string; p_payout_id: string }
        Returns: string
      }
      admin_purge_user_data: { Args: { p_user: string }; Returns: undefined }
      admin_review_garage_withdrawal: {
        Args: {
          p_actor_id: string
          p_decision: string
          p_reason?: string
          p_withdrawal_id: string
        }
        Returns: Database['public']['Enums']['payout_status']
      }
      admin_review_install_proof: {
        Args: {
          p_actor_id: string
          p_decision: Database['public']['Enums']['photo_status']
          p_photo_id: string
          p_reason?: string
        }
        Returns: number
      }
      approve_campaign: {
        Args: {
          p_campaign_id: string
          p_decision: Database['public']['Enums']['campaign_status']
          p_reason?: string
        }
        Returns: undefined
      }
      approve_driver_kyc: {
        Args: {
          p_decision: Database['public']['Enums']['kyc_status']
          p_driver_id: string
          p_reason?: string
        }
        Returns: undefined
      }
      assert_transition: {
        Args: { entity_type: string; from_state: string; to_state: string }
        Returns: undefined
      }
      choose_role: {
        Args: { target: Database['public']['Enums']['user_role'] }
        Returns: {
          blocked: boolean
          created_at: string
          email: string | null
          full_name: string
          id: string
          kyc_reviewed_at: string | null
          kyc_reviewed_by: string | null
          kyc_status: Database['public']['Enums']['kyc_status']
          phone_e164: string | null
          role: Database['public']['Enums']['user_role']
        }
        SetofOptions: {
          from: '*'
          to: 'profiles'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      ensure_driver_monthly_earning_period: {
        Args: {
          p_contract_id: string
          p_driver_id: string
          p_period_end: string
          p_period_start: string
        }
        Returns: string
      }
      is_admin: { Args: { uid?: string }; Returns: boolean }
      partner_create_campaign_with_reserve: {
        Args: {
          p_active_driver_limit: number
          p_brief: string
          p_budget_vnd: number
          p_creative_url: string
          p_creative_urls: string[]
          p_driver_net_monthly_vnd: number
          p_end_date: string
          p_monthly_budget_vnd: number
          p_name: string
          p_partner_id: string
          p_qr_target_url: string
          p_requested_driver_count: number
          p_start_date: string
          p_target_districts: string[]
        }
        Returns: string
      }
      process_sepay_partner_topup_webhook: {
        Args: {
          p_account_number: string
          p_amount_vnd: number
          p_expected_account_number?: string
          p_min_amount_vnd?: number
          p_payload: Json
          p_tax_code: string
          p_transfer_type: string
          p_txn_id: string
        }
        Returns: Json
      }
      request_garage_withdrawal: {
        Args: {
          p_amount_vnd: number
          p_bank_snapshot: Json
          p_garage_id: string
          p_invoice_html: string
          p_withdrawal_number: string
        }
        Returns: string
      }
      set_user_blocked: {
        Args: { p_blocked: boolean; p_target_id: string }
        Returns: undefined
      }
      transition_campaign: {
        Args: {
          campaign_id: string
          new_status: Database['public']['Enums']['campaign_status']
        }
        Returns: {
          active_driver_limit: number | null
          balance_percent: number | null
          brief: string | null
          budget_vnd: number
          created_at: string
          creative_url: string | null
          creative_urls: string[]
          daily_cap_km: number
          driver_net_monthly_vnd: number
          end_date: string
          ev_multiplier: number
          funding_mode: string
          id: string
          monthly_budget_vnd: number | null
          name: string
          partner_id: string
          platform_fee_pct: number
          qr_target_url: string
          rate_per_km_vnd: number
          reject_reason: string | null
          requested_driver_count: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          spent_vnd: number
          start_date: string
          status: Database['public']['Enums']['campaign_status']
          target_districts: string[] | null
          target_vehicle_types: Database['public']['Enums']['vehicle_fuel'][] | null
        }
        SetofOptions: {
          from: '*'
          to: 'campaigns'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      transition_contract: {
        Args: {
          contract_id: string
          new_status: Database['public']['Enums']['contract_status']
        }
        Returns: {
          campaign_id: string
          created_at: string
          driver_id: string
          earned_vnd: number
          earning_approved_at: string | null
          earning_approved_by: string | null
          earning_start_date: string | null
          garage_selected_at: string | null
          id: string
          install_garage_id: string | null
          install_note: string | null
          installed_at: string | null
          km_total: number
          removed_at: string | null
          status: Database['public']['Enums']['contract_status']
          vehicle_id: string
        }
        SetofOptions: {
          from: '*'
          to: 'contracts'
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      campaign_status:
        | 'draft'
        | 'submitted'
        | 'approved'
        | 'rejected'
        | 'awaiting_install'
        | 'active'
        | 'paused'
        | 'completed'
        | 'cancelled'
      contract_status:
        | 'matched'
        | 'awaiting_install'
        | 'installed'
        | 'running'
        | 'completed'
        | 'terminated'
        | 'disputed'
      driver_invoice_status: 'requested' | 'reviewing' | 'approved' | 'paid' | 'rejected'
      kyc_status: 'pending' | 'approved' | 'rejected'
      ledger_kind:
        | 'partner_topup'
        | 'partner_charge'
        | 'driver_accrual'
        | 'driver_payout'
        | 'platform_fee'
        | 'garage_install_payout'
      partner_status: 'pending' | 'approved' | 'rejected'
      payout_status: 'pending' | 'processing' | 'paid' | 'failed'
      photo_kind:
        | 'kyc_cccd_front'
        | 'kyc_cccd_back'
        | 'kyc_selfie'
        | 'install_proof'
        | 'removal_proof'
        | 'periodic_vehicle'
        | 'periodic_selfie'
      photo_status: 'pending' | 'approved' | 'rejected'
      user_role: 'pending' | 'driver' | 'partner' | 'admin' | 'garage'
      vehicle_fuel: 'petrol' | 'diesel' | 'electric' | 'hybrid'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      campaign_status: [
        'draft',
        'submitted',
        'approved',
        'rejected',
        'awaiting_install',
        'active',
        'paused',
        'completed',
        'cancelled',
      ],
      contract_status: [
        'matched',
        'awaiting_install',
        'installed',
        'running',
        'completed',
        'terminated',
        'disputed',
      ],
      driver_invoice_status: ['requested', 'reviewing', 'approved', 'paid', 'rejected'],
      kyc_status: ['pending', 'approved', 'rejected'],
      ledger_kind: [
        'partner_topup',
        'partner_charge',
        'driver_accrual',
        'driver_payout',
        'platform_fee',
        'garage_install_payout',
      ],
      partner_status: ['pending', 'approved', 'rejected'],
      payout_status: ['pending', 'processing', 'paid', 'failed'],
      photo_kind: [
        'kyc_cccd_front',
        'kyc_cccd_back',
        'kyc_selfie',
        'install_proof',
        'removal_proof',
        'periodic_vehicle',
        'periodic_selfie',
      ],
      photo_status: ['pending', 'approved', 'rejected'],
      user_role: ['pending', 'driver', 'partner', 'admin', 'garage'],
      vehicle_fuel: ['petrol', 'diesel', 'electric', 'hybrid'],
    },
  },
} as const
