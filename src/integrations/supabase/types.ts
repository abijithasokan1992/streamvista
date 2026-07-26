export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          email: string
          role: string
          company_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          email: string
          role?: string
          company_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          email?: string
          role?: string
          company_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      titles: {
        Row: {
          id: string
          user_id: string
          title: string
          tagline: string | null
          synopsis: string | null
          genre: string
          release_year: number
          runtime_minutes: number
          language: string
          status: 'draft' | 'submitted' | 'qc_passed' | 'qc_failed' | 'legal_cleared' | 'distribution_ready' | 'published'
          poster_url: string | null
          trailer_url: string | null
          master_hls_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          tagline?: string | null
          synopsis?: string | null
          genre: string
          release_year: number
          runtime_minutes: number
          language?: string
          status?: 'draft' | 'submitted' | 'qc_passed' | 'qc_failed' | 'legal_cleared' | 'distribution_ready' | 'published'
          poster_url?: string | null
          trailer_url?: string | null
          master_hls_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          tagline?: string | null
          synopsis?: string | null
          genre?: string
          release_year?: number
          runtime_minutes?: number
          language?: string
          status?: 'draft' | 'submitted' | 'qc_passed' | 'qc_failed' | 'legal_cleared' | 'distribution_ready' | 'published'
          poster_url?: string | null
          trailer_url?: string | null
          master_hls_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      title_edit_requests: {
        Row: {
          id: string
          title_id: string
          requester_id: string
          requested_changes: Json
          status: 'open' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title_id: string
          requester_id: string
          requested_changes: Json
          status?: 'open' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title_id?: string
          requester_id?: string
          requested_changes?: Json
          status?: 'open' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      draft_titles: {
        Row: {
          id: string
          user_id: string
          draft_id: string
          metadata: Json
          last_saved_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          draft_id: string
          metadata: Json
          last_saved_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          draft_id?: string
          metadata?: Json
          last_saved_at?: string
          created_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          id: string
          title_id: string
          user_id: string
          asset_type: 'poster' | 'trailer' | 'master_video' | 'dit_screenshot' | 'contract'
          file_path: string
          file_size: number
          mime_type: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          title_id: string
          user_id: string
          asset_type: 'poster' | 'trailer' | 'master_video' | 'dit_screenshot' | 'contract'
          file_path: string
          file_size: number
          mime_type: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          title_id?: string
          user_id?: string
          asset_type?: 'poster' | 'trailer' | 'master_video' | 'dit_screenshot' | 'contract'
          file_path?: string
          file_size?: number
          mime_type?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      qc_reports: {
        Row: {
          id: string
          title_id: string
          reviewer_id: string
          status: 'pending' | 'passed' | 'corrections_required'
          technical_notes: string | null
          audio_pass: boolean
          video_pass: boolean
          metadata_pass: boolean
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title_id: string
          reviewer_id: string
          status?: 'pending' | 'passed' | 'corrections_required'
          technical_notes?: string | null
          audio_pass?: boolean
          video_pass?: boolean
          metadata_pass?: boolean
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title_id?: string
          reviewer_id?: string
          status?: 'pending' | 'passed' | 'corrections_required'
          technical_notes?: string | null
          audio_pass?: boolean
          video_pass?: boolean
          metadata_pass?: boolean
          reviewed_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      legal_reviews: {
        Row: {
          id: string
          title_id: string
          attorney_id: string
          status: 'pending' | 'cleared' | 'rejected'
          contract_url: string | null
          clearance_notes: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title_id: string
          attorney_id: string
          status?: 'pending' | 'cleared' | 'rejected'
          contract_url?: string | null
          clearance_notes?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title_id?: string
          attorney_id?: string
          status?: 'pending' | 'cleared' | 'rejected'
          contract_url?: string | null
          clearance_notes?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      revenue_statements: {
        Row: {
          id: string
          statement_period: string
          buyer_name: string
          total_revenue: number
          platform_fee: number
          creator_payout: number
          status: string
          imported_at: string
        }
        Insert: {
          id?: string
          statement_period: string
          buyer_name: string
          total_revenue: number
          platform_fee: number
          creator_payout: number
          status?: string
          imported_at?: string
        }
        Update: {
          id?: string
          statement_period?: string
          buyer_name?: string
          total_revenue?: number
          platform_fee?: number
          creator_payout?: number
          status?: string
          imported_at?: string
        }
        Relationships: []
      }
      revenue_rows: {
        Row: {
          id: string
          statement_id: string
          title_id: string | null
          buyer_id: string | null
          raw_title_name: string
          gross_amount: number
          net_amount: number
          status: 'unmapped' | 'mapped' | 'quarantined'
          created_at: string
        }
        Insert: {
          id?: string
          statement_id: string
          title_id?: string | null
          buyer_id?: string | null
          raw_title_name: string
          gross_amount: number
          net_amount: number
          status?: 'unmapped' | 'mapped' | 'quarantined'
          created_at?: string
        }
        Update: {
          id?: string
          statement_id?: string
          title_id?: string | null
          buyer_id?: string | null
          raw_title_name?: string
          gross_amount?: number
          net_amount?: number
          status?: 'unmapped' | 'mapped' | 'quarantined'
          created_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          id: string
          creator_id: string
          amount: number
          currency: string
          status: 'draft' | 'pending' | 'paid'
          due_date: string
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          amount: number
          currency?: string
          status?: 'draft' | 'pending' | 'paid'
          due_date: string
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          amount?: number
          currency?: string
          status?: 'draft' | 'pending' | 'paid'
          due_date?: string
          created_at?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          id: string
          creator_id: string
          amount: number
          status: 'processing' | 'completed' | 'failed'
          transaction_ref: string | null
          processed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          amount: number
          status?: 'processing' | 'completed' | 'failed'
          transaction_ref?: string | null
          processed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          amount?: number
          status?: 'processing' | 'completed' | 'failed'
          transaction_ref?: string | null
          processed_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string | null
          details: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          entity_type: string
          entity_id?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          entity_type?: string
          entity_id?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
