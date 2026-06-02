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
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          diff: Json | null
          entity_id: string | null
          entity_type: string
          id: number
          ts: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          diff?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: number
          ts?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          diff?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: number
          ts?: string
        }
        Relationships: [
          {
            foreignKeyName: 'audit_log_actor_id_fkey'
            columns: ['actor_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      campaigns: {
        Row: {
          brief: string | null
          budget_vnd: number
          created_at: string
          creative_url: string | null
          daily_cap_km: number
          end_date: string
          ev_multiplier: number
          id: string
          name: string
          partner_id: string
          qr_target_url: string
          rate_per_km_vnd: number
          reject_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          spent_vnd: number
          start_date: string
          status: Database['public']['Enums']['campaign_status']
          target_districts: string[] | null
          target_vehicle_types: Database['public']['Enums']['vehicle_fuel'][] | null
        }
        Insert: {
          brief?: string | null
          budget_vnd: number
          created_at?: string
          creative_url?: string | null
          daily_cap_km?: number
          end_date: string
          ev_multiplier?: number
          id?: string
          name: string
          partner_id: string
          qr_target_url: string
          rate_per_km_vnd: number
          reject_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          spent_vnd?: number
          start_date: string
          status?: Database['public']['Enums']['campaign_status']
          target_districts?: string[] | null
          target_vehicle_types?: Database['public']['Enums']['vehicle_fuel'][] | null
        }
        Update: {
          brief?: string | null
          budget_vnd?: number
          created_at?: string
          creative_url?: string | null
          daily_cap_km?: number
          end_date?: string
          ev_multiplier?: number
          id?: string
          name?: string
          partner_id?: string
          qr_target_url?: string
          rate_per_km_vnd?: number
          reject_reason?: string | null
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
      contract_daily_stats: {
        Row: {
          active_min: number
          contract_id: string
          day: string
          earned_vnd: number
          km_rejected: number
          km_valid: number
          photo_done: boolean
          photo_required: boolean
          qr_scans: number
        }
        Insert: {
          active_min?: number
          contract_id: string
          day: string
          earned_vnd?: number
          km_rejected?: number
          km_valid?: number
          photo_done?: boolean
          photo_required?: boolean
          qr_scans?: number
        }
        Update: {
          active_min?: number
          contract_id?: string
          day?: string
          earned_vnd?: number
          km_rejected?: number
          km_valid?: number
          photo_done?: boolean
          photo_required?: boolean
          qr_scans?: number
        }
        Relationships: [
          {
            foreignKeyName: 'contract_daily_stats_contract_id_fkey'
            columns: ['contract_id']
            isOneToOne: false
            referencedRelation: 'contracts'
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
          id: string
          install_garage_id: string | null
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
          id?: string
          install_garage_id?: string | null
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
          id?: string
          install_garage_id?: string | null
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
      drivers: {
        Row: {
          bank_account_name: string | null
          bank_account_number: string | null
          bank_bin: string | null
          body_type: string | null
          cccd_number: string | null
          id: string
          primary_city: string
          rating: number | null
        }
        Insert: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_bin?: string | null
          body_type?: string | null
          cccd_number?: string | null
          id: string
          primary_city?: string
          rating?: number | null
        }
        Update: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_bin?: string | null
          body_type?: string | null
          cccd_number?: string | null
          id?: string
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
      garages: {
        Row: {
          address: string
          approved: boolean
          id: string
          lat: number | null
          lng: number | null
          rating: number | null
          shop_name: string
        }
        Insert: {
          address: string
          approved?: boolean
          id: string
          lat?: number | null
          lng?: number | null
          rating?: number | null
          shop_name: string
        }
        Update: {
          address?: string
          approved?: boolean
          id?: string
          lat?: number | null
          lng?: number | null
          rating?: number | null
          shop_name?: string
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
      gps_logs: {
        Row: {
          accuracy_m: number | null
          battery_pct: number | null
          client_nonce: string
          client_seq: number
          contract_id: string
          id: number
          ip_country: string | null
          point: unknown
          server_ts: string
          speed_kmh: number | null
          ts: string
        }
        Insert: {
          accuracy_m?: number | null
          battery_pct?: number | null
          client_nonce: string
          client_seq: number
          contract_id: string
          id?: number
          ip_country?: string | null
          point: unknown
          server_ts?: string
          speed_kmh?: number | null
          ts: string
        }
        Update: {
          accuracy_m?: number | null
          battery_pct?: number | null
          client_nonce?: string
          client_seq?: number
          contract_id?: string
          id?: number
          ip_country?: string | null
          point?: unknown
          server_ts?: string
          speed_kmh?: number | null
          ts?: string
        }
        Relationships: [
          {
            foreignKeyName: 'gps_logs_contract_id_fkey'
            columns: ['contract_id']
            isOneToOne: false
            referencedRelation: 'contracts'
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
          id: string
          platform_fee_pct: number
        }
        Insert: {
          base_rate_per_km_vnd: number
          created_at?: string
          created_by?: string | null
          daily_cap_km: number
          effective_from: string
          ev_multiplier: number
          id?: string
          platform_fee_pct: number
        }
        Update: {
          base_rate_per_km_vnd?: number
          created_at?: string
          created_by?: string | null
          daily_cap_km?: number
          effective_from?: string
          ev_multiplier?: number
          id?: string
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
      qr_scans: {
        Row: {
          contract_id: string
          geo_city: string | null
          id: number
          ip: unknown
          referrer: string | null
          scanned_at: string
          user_agent: string | null
        }
        Insert: {
          contract_id: string
          geo_city?: string | null
          id?: number
          ip?: unknown
          referrer?: string | null
          scanned_at?: string
          user_agent?: string | null
        }
        Update: {
          contract_id?: string
          geo_city?: string | null
          id?: number
          ip?: unknown
          referrer?: string | null
          scanned_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'qr_scans_contract_id_fkey'
            columns: ['contract_id']
            isOneToOne: false
            referencedRelation: 'contracts'
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
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
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
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ''?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { '': string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      admin_create_money_ledger_entry: {
        Args: {
          p_actor_id: string
          p_target_type: string
          p_target_id: string
          p_kind: Database['public']['Enums']['ledger_kind']
          p_amount_vnd: number
          p_note: string | null
          p_ref_type?: string | null
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
          p_driver_id: string
          p_decision: Database['public']['Enums']['kyc_status']
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
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      geometry: { Args: { '': string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { '': string }; Returns: unknown }
      gettransactionid: { Args: never; Returns: unknown }
      is_admin: { Args: { uid?: string }; Returns: boolean }
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      set_user_blocked: {
        Args: { p_target_id: string; p_blocked: boolean }
        Returns: undefined
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { '': string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { '': string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { '': string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { '': string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { '': string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { '': string }; Returns: string }
      st_astext: { Args: { '': string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { '': string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { '': string }; Returns: unknown }
      st_geographyfromtext: { Args: { '': string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { '': string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { '': string }; Returns: unknown }
      st_geomfromewkt: { Args: { '': string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { '': Json }; Returns: unknown }
        | { Args: { '': Json }; Returns: unknown }
        | { Args: { '': string }; Returns: unknown }
      st_geomfromgml: { Args: { '': string }; Returns: unknown }
      st_geomfromkml: { Args: { '': string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { '': string }; Returns: unknown }
      st_gmltosql: { Args: { '': string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database['public']['CompositeTypes']['valid_detail']
        SetofOptions: {
          from: '*'
          to: 'valid_detail'
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { '': string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { '': string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { '': string }; Returns: unknown }
      st_mpointfromtext: { Args: { '': string }; Returns: unknown }
      st_mpolyfromtext: { Args: { '': string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { '': string }; Returns: unknown }
      st_multipointfromtext: { Args: { '': string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { '': string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { '': string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { '': string }; Returns: unknown }
      st_polygonfromtext: { Args: { '': string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { '': string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      transition_campaign: {
        Args: {
          campaign_id: string
          new_status: Database['public']['Enums']['campaign_status']
        }
        Returns: {
          brief: string | null
          budget_vnd: number
          created_at: string
          creative_url: string | null
          daily_cap_km: number
          end_date: string
          ev_multiplier: number
          id: string
          name: string
          partner_id: string
          qr_target_url: string
          rate_per_km_vnd: number
          reject_reason: string | null
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
          id: string
          install_garage_id: string | null
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
      unlockrows: { Args: { '': string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
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
      kyc_status: 'pending' | 'approved' | 'rejected'
      partner_status: 'pending' | 'approved' | 'rejected'
      ledger_kind:
        | 'partner_topup'
        | 'partner_charge'
        | 'driver_accrual'
        | 'driver_payout'
        | 'platform_fee'
        | 'adjustment'
        | 'refund'
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
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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
      kyc_status: ['pending', 'approved', 'rejected'],
      ledger_kind: [
        'partner_topup',
        'partner_charge',
        'driver_accrual',
        'driver_payout',
        'platform_fee',
        'adjustment',
        'refund',
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

// Hand-rolled aliases for common enums. Lets callers import { UserRole } from
// '@/types/db' instead of the long Database['public']['Enums']['…'] path.
export type UserRole = Database['public']['Enums']['user_role']
export type KycStatus = Database['public']['Enums']['kyc_status']
export type PartnerStatus = Database['public']['Enums']['partner_status']
export type CampaignStatus = Database['public']['Enums']['campaign_status']
export type ContractStatus = Database['public']['Enums']['contract_status']
