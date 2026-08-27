export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      brand_profiles: {
        Row: {
          company_size: string | null
          description: string | null
          differentiators: Json | null
          features: Json | null
          icps: Json | null
          industry: string | null
          product_summary: string | null
          scanned_at: string | null
          tagline: string | null
          value_prop: string | null
          workspace_id: string
        }
        Insert: {
          company_size?: string | null
          description?: string | null
          differentiators?: Json | null
          features?: Json | null
          icps?: Json | null
          industry?: string | null
          product_summary?: string | null
          scanned_at?: string | null
          tagline?: string | null
          value_prop?: string | null
          workspace_id: string
        }
        Update: {
          company_size?: string | null
          description?: string | null
          differentiators?: Json | null
          features?: Json | null
          icps?: Json | null
          industry?: string | null
          product_summary?: string | null
          scanned_at?: string | null
          tagline?: string | null
          value_prop?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_profiles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      briefs: {
        Row: {
          campaign_id: string | null
          content: Json | null
          created_at: string | null
          guidelines: string | null
          id: string
          key_messages: Json | null
          objectives: string | null
          source: Database["public"]["Enums"]["brief_source"] | null
          status: string | null
          title: string | null
          workspace_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          content?: Json | null
          created_at?: string | null
          guidelines?: string | null
          id?: string
          key_messages?: Json | null
          objectives?: string | null
          source?: Database["public"]["Enums"]["brief_source"] | null
          status?: string | null
          title?: string | null
          workspace_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          content?: Json | null
          created_at?: string | null
          guidelines?: string | null
          id?: string
          key_messages?: Json | null
          objectives?: string | null
          source?: Database["public"]["Enums"]["brief_source"] | null
          status?: string | null
          title?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "briefs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "briefs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          channel: string | null
          created_at: string | null
          id: string
          name: string
          objective: string | null
          open_to_applications: boolean | null
          post_deadline_days: number | null
          region: string | null
          status: string | null
          workspace_id: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          id?: string
          name: string
          objective?: string | null
          open_to_applications?: boolean | null
          post_deadline_days?: number | null
          region?: string | null
          status?: string | null
          workspace_id?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          id?: string
          name?: string
          objective?: string | null
          open_to_applications?: boolean | null
          post_deadline_days?: number | null
          region?: string | null
          status?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      click_events: {
        Row: {
          company: string | null
          context: Json
          id: string
          ip_hash: string | null
          is_qualified: boolean
          occurred_at: string
          tracking_link_id: string
        }
        Insert: {
          company?: string | null
          context?: Json
          id?: string
          ip_hash?: string | null
          is_qualified?: boolean
          occurred_at?: string
          tracking_link_id: string
        }
        Update: {
          company?: string | null
          context?: Json
          id?: string
          ip_hash?: string | null
          is_qualified?: boolean
          occurred_at?: string
          tracking_link_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "click_events_tracking_link_id_fkey"
            columns: ["tracking_link_id"]
            isOneToOne: false
            referencedRelation: "tracking_links"
            referencedColumns: ["id"]
          },
        ]
      }
      collaboration_deliverables: {
        Row: {
          collaboration_id: string
          created_at: string
          description: string
          id: string
          ordinal: number
        }
        Insert: {
          collaboration_id: string
          created_at?: string
          description: string
          id?: string
          ordinal?: number
        }
        Update: {
          collaboration_id?: string
          created_at?: string
          description?: string
          id?: string
          ordinal?: number
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_deliverables_collaboration_id_fkey"
            columns: ["collaboration_id"]
            isOneToOne: false
            referencedRelation: "collaborations"
            referencedColumns: ["id"]
          },
        ]
      }
      collaboration_events: {
        Row: {
          actor_id: string | null
          collaboration_id: string
          created_at: string | null
          id: string
          payload: Json | null
          type: string
        }
        Insert: {
          actor_id?: string | null
          collaboration_id: string
          created_at?: string | null
          id?: string
          payload?: Json | null
          type: string
        }
        Update: {
          actor_id?: string | null
          collaboration_id?: string
          created_at?: string | null
          id?: string
          payload?: Json | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaboration_events_collaboration_id_fkey"
            columns: ["collaboration_id"]
            isOneToOne: false
            referencedRelation: "collaborations"
            referencedColumns: ["id"]
          },
        ]
      }
      collaboration_offers: {
        Row: {
          accepted_at: string | null
          collaboration_id: string
          created_at: string
          currency: string
          expires_at: string | null
          fee_cents: number
          id: string
          list_price_cents: number
          proposer_id: string
          proposer_role: Database["public"]["Enums"]["user_role"]
          superseded_offer_id: string | null
          terms_snapshot: Json
        }
        Insert: {
          accepted_at?: string | null
          collaboration_id: string
          created_at?: string
          currency: string
          expires_at?: string | null
          fee_cents: number
          id?: string
          list_price_cents: number
          proposer_id: string
          proposer_role: Database["public"]["Enums"]["user_role"]
          superseded_offer_id?: string | null
          terms_snapshot?: Json
        }
        Update: {
          accepted_at?: string | null
          collaboration_id?: string
          created_at?: string
          currency?: string
          expires_at?: string | null
          fee_cents?: number
          id?: string
          list_price_cents?: number
          proposer_id?: string
          proposer_role?: Database["public"]["Enums"]["user_role"]
          superseded_offer_id?: string | null
          terms_snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_offers_collaboration_id_fkey"
            columns: ["collaboration_id"]
            isOneToOne: false
            referencedRelation: "collaborations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaboration_offers_proposer_id_fkey"
            columns: ["proposer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaboration_offers_superseded_offer_id_fkey"
            columns: ["superseded_offer_id"]
            isOneToOne: false
            referencedRelation: "collaboration_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborations: {
        Row: {
          accepted_offer_id: string | null
          approval_required: boolean | null
          brief_id: string | null
          campaign_id: string | null
          created_at: string | null
          creator_id: string
          current_offer_id: string | null
          deleted_at: string | null
          deliverables: string | null
          id: string
          idempotency_key: string | null
          offer_type: Database["public"]["Enums"]["offer_type"] | null
          origin: Database["public"]["Enums"]["collab_origin"]
          post_by: string | null
          published_at: string | null
          respond_by: string | null
          responded_at: string | null
          status: Database["public"]["Enums"]["collab_status"]
          tracking_url: string | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          accepted_offer_id?: string | null
          approval_required?: boolean | null
          brief_id?: string | null
          campaign_id?: string | null
          created_at?: string | null
          creator_id: string
          current_offer_id?: string | null
          deleted_at?: string | null
          deliverables?: string | null
          id?: string
          idempotency_key?: string | null
          offer_type?: Database["public"]["Enums"]["offer_type"] | null
          origin: Database["public"]["Enums"]["collab_origin"]
          post_by?: string | null
          published_at?: string | null
          respond_by?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["collab_status"]
          tracking_url?: string | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          accepted_offer_id?: string | null
          approval_required?: boolean | null
          brief_id?: string | null
          campaign_id?: string | null
          created_at?: string | null
          creator_id?: string
          current_offer_id?: string | null
          deleted_at?: string | null
          deliverables?: string | null
          id?: string
          idempotency_key?: string | null
          offer_type?: Database["public"]["Enums"]["offer_type"] | null
          origin?: Database["public"]["Enums"]["collab_origin"]
          post_by?: string | null
          published_at?: string | null
          respond_by?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["collab_status"]
          tracking_url?: string | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaborations_accepted_offer_same_collab"
            columns: ["id", "accepted_offer_id"]
            isOneToOne: false
            referencedRelation: "collaboration_offers"
            referencedColumns: ["collaboration_id", "id"]
          },
          {
            foreignKeyName: "collaborations_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "briefs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborations_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborations_current_offer_same_collab"
            columns: ["id", "current_offer_id"]
            isOneToOne: false
            referencedRelation: "collaboration_offers"
            referencedColumns: ["collaboration_id", "id"]
          },
          {
            foreignKeyName: "collaborations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          creator_id: string | null
          id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          id?: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_bundles: {
        Row: {
          creator_id: string | null
          id: string
          is_primary: boolean | null
          num_posts: number
          total_price_cents: number
        }
        Insert: {
          creator_id?: string | null
          id?: string
          is_primary?: boolean | null
          num_posts: number
          total_price_cents: number
        }
        Update: {
          creator_id?: string | null
          id?: string
          is_primary?: boolean | null
          num_posts?: number
          total_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "creator_bundles_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_private_profiles: {
        Row: {
          bank_holder: string | null
          bank_iban_last4: string | null
          created_at: string | null
          creator_id: string
          has_registered_business: boolean | null
          last_scraped_at: string | null
          payout_method: Database["public"]["Enums"]["payout_method"] | null
          registration_country: string | null
          stripe_connected: boolean | null
          tax_id: string | null
          updated_at: string | null
        }
        Insert: {
          bank_holder?: string | null
          bank_iban_last4?: string | null
          created_at?: string | null
          creator_id: string
          has_registered_business?: boolean | null
          last_scraped_at?: string | null
          payout_method?: Database["public"]["Enums"]["payout_method"] | null
          registration_country?: string | null
          stripe_connected?: boolean | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Update: {
          bank_holder?: string | null
          bank_iban_last4?: string | null
          created_at?: string | null
          creator_id?: string
          has_registered_business?: boolean | null
          last_scraped_at?: string | null
          payout_method?: Database["public"]["Enums"]["payout_method"] | null
          registration_country?: string | null
          stripe_connected?: boolean | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_private_profiles_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: true
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          audience_snapshot: Json | null
          country: string | null
          created_at: string | null
          display_name: string | null
          est_impressions: number | null
          followers: number | null
          headline: string | null
          id: string
          industries: string[] | null
          linkedin_url: string | null
          marketplace_visible: boolean | null
          match_default: number | null
          price_per_post_cents: number | null
        }
        Insert: {
          audience_snapshot?: Json | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          est_impressions?: number | null
          followers?: number | null
          headline?: string | null
          id: string
          industries?: string[] | null
          linkedin_url?: string | null
          marketplace_visible?: boolean | null
          match_default?: number | null
          price_per_post_cents?: number | null
        }
        Update: {
          audience_snapshot?: Json | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          est_impressions?: number | null
          followers?: number | null
          headline?: string | null
          id?: string
          industries?: string[] | null
          linkedin_url?: string | null
          marketplace_visible?: boolean | null
          match_default?: number | null
          price_per_post_cents?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "creators_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fund_holds: {
        Row: {
          amount_cents: number
          captured_transaction_id: string | null
          collaboration_id: string
          created_at: string
          currency: string
          id: string
          offer_id: string
          refunded_transaction_id: string | null
          status: Database["public"]["Enums"]["fund_hold_status"]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          amount_cents: number
          captured_transaction_id?: string | null
          collaboration_id: string
          created_at?: string
          currency: string
          id?: string
          offer_id: string
          refunded_transaction_id?: string | null
          status?: Database["public"]["Enums"]["fund_hold_status"]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          amount_cents?: number
          captured_transaction_id?: string | null
          collaboration_id?: string
          created_at?: string
          currency?: string
          id?: string
          offer_id?: string
          refunded_transaction_id?: string | null
          status?: Database["public"]["Enums"]["fund_hold_status"]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fund_holds_captured_transaction_id_fkey"
            columns: ["captured_transaction_id"]
            isOneToOne: true
            referencedRelation: "wallet_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fund_holds_collaboration_id_fkey"
            columns: ["collaboration_id"]
            isOneToOne: false
            referencedRelation: "collaborations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fund_holds_offer_same_collab"
            columns: ["collaboration_id", "offer_id"]
            isOneToOne: false
            referencedRelation: "collaboration_offers"
            referencedColumns: ["collaboration_id", "id"]
          },
          {
            foreignKeyName: "fund_holds_refunded_transaction_id_fkey"
            columns: ["refunded_transaction_id"]
            isOneToOne: true
            referencedRelation: "wallet_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fund_holds_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string | null
          conversation_id: string | null
          created_at: string | null
          id: string
          sender_id: string | null
        }
        Insert: {
          body?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          sender_id?: string | null
        }
        Update: {
          body?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount_cents: number
          collaboration_id: string | null
          created_at: string | null
          creator_id: string | null
          id: string
          method: Database["public"]["Enums"]["payout_method"] | null
          paid_at: string | null
          status: Database["public"]["Enums"]["payout_status"]
        }
        Insert: {
          amount_cents: number
          collaboration_id?: string | null
          created_at?: string | null
          creator_id?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payout_method"] | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
        }
        Update: {
          amount_cents?: number
          collaboration_id?: string | null
          created_at?: string | null
          creator_id?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payout_method"] | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payouts_collaboration_id_fkey"
            columns: ["collaboration_id"]
            isOneToOne: false
            referencedRelation: "collaborations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          collaboration_id: string
          comments: number | null
          deliverable_id: string | null
          id: string
          impressions: number | null
          linkedin_url: string | null
          published_at: string | null
          reactions: number | null
          reposts: number | null
        }
        Insert: {
          collaboration_id: string
          comments?: number | null
          deliverable_id?: string | null
          id?: string
          impressions?: number | null
          linkedin_url?: string | null
          published_at?: string | null
          reactions?: number | null
          reposts?: number | null
        }
        Update: {
          collaboration_id?: string
          comments?: number | null
          deliverable_id?: string | null
          id?: string
          impressions?: number | null
          linkedin_url?: string | null
          published_at?: string | null
          reactions?: number | null
          reposts?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_collaboration_id_fkey"
            columns: ["collaboration_id"]
            isOneToOne: false
            referencedRelation: "collaborations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_deliverable_same_collab"
            columns: ["collaboration_id", "deliverable_id"]
            isOneToOne: false
            referencedRelation: "collaboration_deliverables"
            referencedColumns: ["collaboration_id", "id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          locale: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          locale?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          locale?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          code: string | null
          created_at: string | null
          id: string
          invited_type: string | null
          referrer_id: string | null
          reward_months: number | null
          reward_pct: number | null
          status: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          id?: string
          invited_type?: string | null
          referrer_id?: string | null
          reward_months?: number | null
          reward_pct?: number | null
          status?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          id?: string
          invited_type?: string | null
          referrer_id?: string | null
          reward_months?: number | null
          reward_pct?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_links: {
        Row: {
          active: boolean
          collaboration_id: string
          created_at: string
          deliverable_id: string | null
          destination_url: string
          id: string
          token: string
        }
        Insert: {
          active?: boolean
          collaboration_id: string
          created_at?: string
          deliverable_id?: string | null
          destination_url: string
          id?: string
          token?: string
        }
        Update: {
          active?: boolean
          collaboration_id?: string
          created_at?: string
          deliverable_id?: string | null
          destination_url?: string
          id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_links_collaboration_id_fkey"
            columns: ["collaboration_id"]
            isOneToOne: false
            referencedRelation: "collaborations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_links_deliverable_same_collab"
            columns: ["collaboration_id", "deliverable_id"]
            isOneToOne: false
            referencedRelation: "collaboration_deliverables"
            referencedColumns: ["collaboration_id", "id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount_cents: number
          collaboration_id: string | null
          created_at: string
          currency: string
          id: string
          idempotency_key: string
          type: Database["public"]["Enums"]["wallet_txn_type"]
          workspace_id: string
        }
        Insert: {
          amount_cents: number
          collaboration_id?: string | null
          created_at?: string
          currency: string
          id?: string
          idempotency_key: string
          type: Database["public"]["Enums"]["wallet_txn_type"]
          workspace_id: string
        }
        Update: {
          amount_cents?: number
          collaboration_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          idempotency_key?: string
          type?: Database["public"]["Enums"]["wallet_txn_type"]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_collaboration_id_fkey"
            columns: ["collaboration_id"]
            isOneToOne: false
            referencedRelation: "collaborations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string | null
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          website: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          website?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_or_decline_offer: {
        Args: {
          p_action: string
          p_collaboration_id: string
          p_creator_id: string
        }
        Returns: string
      }
      create_brand_invite: {
        Args: {
          p_approval_required: boolean
          p_brief_id?: string
          p_creator_id: string
          p_currency: string
          p_fee_cents: number
          p_idempotency_key: string
          p_list_price_cents: number
          p_offer_type: Database["public"]["Enums"]["offer_type"]
          p_post_by: string
          p_proposer_id: string
          p_workspace_id: string
        }
        Returns: string
      }
      is_member: { Args: { ws: string }; Returns: boolean }
      wallet_available_cents: {
        Args: { iso_currency: string; ws: string }
        Returns: number
      }
    }
    Enums: {
      brief_source: "ai" | "link" | "concierge" | "manual"
      collab_origin: "brand_invite" | "creator_application"
      collab_status:
        | "requested"
        | "negotiating"
        | "accepted"
        | "declined"
        | "withdrawn"
        | "expired"
        | "brief_pending"
        | "content_submitted"
        | "revision_requested"
        | "approved"
        | "scheduled"
        | "published"
        | "completed"
        | "cancelled"
      fund_hold_status: "reserved" | "captured" | "released" | "refunded"
      offer_type: "single_post" | "bundle"
      payout_method: "bank" | "stripe"
      payout_status: "pending" | "in_transit" | "available" | "withdrawn"
      user_role: "brand" | "creator"
      wallet_txn_type: "topup" | "charge" | "refund"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      brief_source: ["ai", "link", "concierge", "manual"],
      collab_origin: ["brand_invite", "creator_application"],
      collab_status: [
        "requested",
        "negotiating",
        "accepted",
        "declined",
        "withdrawn",
        "expired",
        "brief_pending",
        "content_submitted",
        "revision_requested",
        "approved",
        "scheduled",
        "published",
        "completed",
        "cancelled",
      ],
      fund_hold_status: ["reserved", "captured", "released", "refunded"],
      offer_type: ["single_post", "bundle"],
      payout_method: ["bank", "stripe"],
      payout_status: ["pending", "in_transit", "available", "withdrawn"],
      user_role: ["brand", "creator"],
      wallet_txn_type: ["topup", "charge", "refund"],
    },
  },
} as const
