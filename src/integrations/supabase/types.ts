export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      rate_limits: {
        Row: {
          created_at: string
          function_name: string
          id: string
          identifier: string
          identifier_type: string
          request_count: number
          updated_at: string
          window_start: string
        }
        Insert: {
          created_at?: string
          function_name: string
          id?: string
          identifier: string
          identifier_type: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Update: {
          created_at?: string
          function_name?: string
          id?: string
          identifier?: string
          identifier_type?: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      site_reports: {
        Row: {
          created_at: string
          details: string | null
          first_reported_at: string
          id: string
          last_reported_at: string
          reasons: string[]
          report_count: number
          trust_score: number | null
          url: string
          url_domain: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          first_reported_at?: string
          id?: string
          last_reported_at?: string
          reasons: string[]
          report_count?: number
          trust_score?: number | null
          url: string
          url_domain: string
        }
        Update: {
          created_at?: string
          details?: string | null
          first_reported_at?: string
          id?: string
          last_reported_at?: string
          reasons?: string[]
          report_count?: number
          trust_score?: number | null
          url?: string
          url_domain?: string
        }
        Relationships: []
      }
      threat_feed_sources: {
        Row: {
          created_at: string
          feed_type: string
          id: string
          last_fetched_at: string | null
          name: string
          status: string | null
          url: string
        }
        Insert: {
          created_at?: string
          feed_type: string
          id?: string
          last_fetched_at?: string | null
          name: string
          status?: string | null
          url: string
        }
        Update: {
          created_at?: string
          feed_type?: string
          id?: string
          last_fetched_at?: string | null
          name?: string
          status?: string | null
          url?: string
        }
        Relationships: []
      }
      threat_feeds: {
        Row: {
          created_at: string
          description: string | null
          domains: string[] | null
          fetched_at: string
          id: string
          metadata: Json | null
          published_at: string | null
          severity: string | null
          source: string
          source_url: string | null
          tactics: string[] | null
          threat_type: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          domains?: string[] | null
          fetched_at?: string
          id?: string
          metadata?: Json | null
          published_at?: string | null
          severity?: string | null
          source: string
          source_url?: string | null
          tactics?: string[] | null
          threat_type: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          domains?: string[] | null
          fetched_at?: string
          id?: string
          metadata?: Json | null
          published_at?: string | null
          severity?: string | null
          source?: string
          source_url?: string | null
          tactics?: string[] | null
          threat_type?: string
          title?: string
        }
        Relationships: []
      }
      url_analysis_cache: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          result: Json
          url: string
          url_hash: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          result: Json
          url: string
          url_hash: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          result?: Json
          url?: string
          url_hash?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_function_name: string
          p_identifier: string
          p_identifier_type: string
          p_max_requests: number
          p_window_hours?: number
        }
        Returns: {
          allowed: boolean
          current_count: number
          remaining: number
          reset_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
