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
      bookings: {
        Row: {
          booking_number: string
          client_email: string | null
          client_name: string
          client_note: string | null
          client_phone: string | null
          created_at: string
          deposit_amount: number
          deposit_received_date: string | null
          event_date: string
          id: string
          job_type: Database["public"]["Enums"]["job_type"]
          location: string | null
          notes: string | null
          package_id: string | null
          status: Database["public"]["Enums"]["booking_status"]
          time_end: string | null
          time_start: string | null
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_number: string
          client_email?: string | null
          client_name: string
          client_note?: string | null
          client_phone?: string | null
          created_at?: string
          deposit_amount?: number
          deposit_received_date?: string | null
          event_date: string
          id?: string
          job_type?: Database["public"]["Enums"]["job_type"]
          location?: string | null
          notes?: string | null
          package_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          time_end?: string | null
          time_start?: string | null
          total_price?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_number?: string
          client_email?: string | null
          client_name?: string
          client_note?: string | null
          client_phone?: string | null
          created_at?: string
          deposit_amount?: number
          deposit_received_date?: string | null
          event_date?: string
          id?: string
          job_type?: Database["public"]["Enums"]["job_type"]
          location?: string | null
          notes?: string | null
          package_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          time_end?: string | null
          time_start?: string | null
          total_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_galleries: {
        Row: {
          access_token: string
          booking_id: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          download_count: number
          expires_at: string | null
          id: string
          is_active: boolean
          layout: string
          show_cover: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string
          booking_id?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          download_count?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          layout?: string
          show_cover?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          booking_id?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          download_count?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          layout?: string
          show_cover?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_galleries_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_images: {
        Row: {
          created_at: string
          file_size: number | null
          filename: string
          gallery_id: string
          id: string
          image_url: string
          sort_order: number
          user_id: string
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          filename: string
          gallery_id: string
          id?: string
          image_url: string
          sort_order?: number
          user_id: string
        }
        Update: {
          created_at?: string
          file_size?: number | null
          filename?: string
          gallery_id?: string
          id?: string
          image_url?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_images_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "delivery_galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          job_type: Database["public"]["Enums"]["job_type"] | null
          name: string
          price: number
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          job_type?: Database["public"]["Enums"]["job_type"] | null
          name: string
          price?: number
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          job_type?: Database["public"]["Enums"]["job_type"] | null
          name?: string
          price?: number
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_images: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_featured: boolean
          job_type: Database["public"]["Enums"]["job_type"]
          sort_order: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_featured?: boolean
          job_type?: Database["public"]["Enums"]["job_type"]
          sort_order?: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_featured?: boolean
          job_type?: Database["public"]["Enums"]["job_type"]
          sort_order?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          booking_terms: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_blocked: boolean | null
          logo_url: string | null
          phone: string | null
          service_details: string | null
          show_signature: boolean | null
          signature_url: string | null
          studio_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          booking_terms?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_blocked?: boolean | null
          logo_url?: string | null
          phone?: string | null
          service_details?: string | null
          show_signature?: boolean | null
          signature_url?: string | null
          studio_name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          booking_terms?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_blocked?: boolean | null
          logo_url?: string | null
          phone?: string | null
          service_details?: string | null
          show_signature?: boolean | null
          signature_url?: string | null
          studio_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quotations: {
        Row: {
          client_email: string | null
          client_name: string
          client_note: string | null
          client_phone: string | null
          created_at: string
          event_date: string | null
          id: string
          job_type: Database["public"]["Enums"]["job_type"]
          location: string | null
          notes: string | null
          package_id: string | null
          quotation_number: string
          status: string
          time_end: string | null
          time_start: string | null
          total_price: number
          updated_at: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          client_email?: string | null
          client_name: string
          client_note?: string | null
          client_phone?: string | null
          created_at?: string
          event_date?: string | null
          id?: string
          job_type?: Database["public"]["Enums"]["job_type"]
          location?: string | null
          notes?: string | null
          package_id?: string | null
          quotation_number: string
          status?: string
          time_end?: string | null
          time_start?: string | null
          total_price?: number
          updated_at?: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          client_email?: string | null
          client_name?: string
          client_note?: string | null
          client_phone?: string | null
          created_at?: string
          event_date?: string | null
          id?: string
          job_type?: Database["public"]["Enums"]["job_type"]
          location?: string | null
          notes?: string | null
          package_id?: string | null
          quotation_number?: string
          status?: string
          time_end?: string | null
          time_start?: string | null
          total_price?: number
          updated_at?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      share_tokens: {
        Row: {
          booking_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          quotation_id: string | null
          token: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          quotation_id?: string | null
          token?: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          quotation_id?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "share_tokens_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_tokens_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_quotation_by_token: {
        Args: { share_token: string }
        Returns: boolean
      }
      get_delivery_gallery_by_token: {
        Args: { p_access_token: string }
        Returns: Json
      }
      get_portfolio_by_user_id: { Args: { p_user_id: string }; Returns: Json }
      get_share_data: { Args: { share_token: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_blocked: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      booking_status:
        | "draft"
        | "waiting_deposit"
        | "booked"
        | "completed"
        | "cancelled"
      job_type: "wedding" | "event" | "corporate" | "portrait" | "other"
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
    Enums: {
      app_role: ["admin", "user"],
      booking_status: [
        "draft",
        "waiting_deposit",
        "booked",
        "completed",
        "cancelled",
      ],
      job_type: ["wedding", "event", "corporate", "portrait", "other"],
    },
  },
} as const
