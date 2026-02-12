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
          created_at: string
          id: string
          owner_id: string
          property_id: string
          status: Database["public"]["Enums"]["booking_status"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          property_id: string
          status?: Database["public"]["Enums"]["booking_status"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          property_id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          is_paid: boolean
          owner_id: string
          property_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_paid?: boolean
          owner_id: string
          property_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_paid?: boolean
          owner_id?: string
          property_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc: {
        Row: {
          citizenship_url: string
          id: string
          reviewed_at: string | null
          selfie_url: string
          status: Database["public"]["Enums"]["kyc_status"]
          submitted_at: string
          user_id: string
        }
        Insert: {
          citizenship_url: string
          id?: string
          reviewed_at?: string | null
          selfie_url: string
          status?: Database["public"]["Enums"]["kyc_status"]
          submitted_at?: string
          user_id: string
        }
        Update: {
          citizenship_url?: string
          id?: string
          reviewed_at?: string | null
          selfie_url?: string
          status?: Database["public"]["Enums"]["kyc_status"]
          submitted_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_moderated: boolean
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_moderated?: boolean
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_moderated?: boolean
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          consent_agreed: boolean
          created_at: string
          full_name: string
          id: string
          phone: string | null
          trust_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          consent_agreed?: boolean
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          trust_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          consent_agreed?: boolean
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          trust_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          bathrooms: number
          created_at: string
          description: string | null
          distance_highway_km: number | null
          electricity: boolean
          floor_number: number
          furnished: Database["public"]["Enums"]["furnished_status"]
          id: string
          is_available: boolean
          is_top_floor: boolean | null
          kitchen: number
          latitude: number
          longitude: number
          owner_family_members: number | null
          owner_id: string
          owner_living: Database["public"]["Enums"]["owner_living"]
          parking: boolean
          preferred_tenant: Database["public"]["Enums"]["preferred_tenant"]
          rent_amount: number
          rooms: number
          size_sqft: number
          title: string
          updated_at: string
          water: Database["public"]["Enums"]["water_facility"]
          wifi: boolean
        }
        Insert: {
          bathrooms?: number
          created_at?: string
          description?: string | null
          distance_highway_km?: number | null
          electricity?: boolean
          floor_number?: number
          furnished?: Database["public"]["Enums"]["furnished_status"]
          id?: string
          is_available?: boolean
          is_top_floor?: boolean | null
          kitchen?: number
          latitude?: number
          longitude?: number
          owner_family_members?: number | null
          owner_id: string
          owner_living?: Database["public"]["Enums"]["owner_living"]
          parking?: boolean
          preferred_tenant?: Database["public"]["Enums"]["preferred_tenant"]
          rent_amount?: number
          rooms?: number
          size_sqft?: number
          title: string
          updated_at?: string
          water?: Database["public"]["Enums"]["water_facility"]
          wifi?: boolean
        }
        Update: {
          bathrooms?: number
          created_at?: string
          description?: string | null
          distance_highway_km?: number | null
          electricity?: boolean
          floor_number?: number
          furnished?: Database["public"]["Enums"]["furnished_status"]
          id?: string
          is_available?: boolean
          is_top_floor?: boolean | null
          kitchen?: number
          latitude?: number
          longitude?: number
          owner_family_members?: number | null
          owner_id?: string
          owner_living?: Database["public"]["Enums"]["owner_living"]
          parking?: boolean
          preferred_tenant?: Database["public"]["Enums"]["preferred_tenant"]
          rent_amount?: number
          rooms?: number
          size_sqft?: number
          title?: string
          updated_at?: string
          water?: Database["public"]["Enums"]["water_facility"]
          wifi?: boolean
        }
        Relationships: []
      }
      property_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          property_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          property_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_preferences: {
        Row: {
          created_at: string
          furnished_pref: Database["public"]["Enums"]["furnished_status"] | null
          id: string
          max_rent: number | null
          parking_req: boolean | null
          preferred_lat: number | null
          preferred_lng: number | null
          rooms: number | null
          search_radius_km: number
          tenant_type: Database["public"]["Enums"]["preferred_tenant"] | null
          updated_at: string
          user_id: string
          water_req: Database["public"]["Enums"]["water_facility"] | null
          wifi_req: boolean | null
        }
        Insert: {
          created_at?: string
          furnished_pref?:
            | Database["public"]["Enums"]["furnished_status"]
            | null
          id?: string
          max_rent?: number | null
          parking_req?: boolean | null
          preferred_lat?: number | null
          preferred_lng?: number | null
          rooms?: number | null
          search_radius_km?: number
          tenant_type?: Database["public"]["Enums"]["preferred_tenant"] | null
          updated_at?: string
          user_id: string
          water_req?: Database["public"]["Enums"]["water_facility"] | null
          wifi_req?: boolean | null
        }
        Update: {
          created_at?: string
          furnished_pref?:
            | Database["public"]["Enums"]["furnished_status"]
            | null
          id?: string
          max_rent?: number | null
          parking_req?: boolean | null
          preferred_lat?: number | null
          preferred_lng?: number | null
          rooms?: number | null
          search_radius_km?: number
          tenant_type?: Database["public"]["Enums"]["preferred_tenant"] | null
          updated_at?: string
          user_id?: string
          water_req?: Database["public"]["Enums"]["water_facility"] | null
          wifi_req?: boolean | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          chat_credits: number | null
          created_at: string
          description: string | null
          id: string
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount?: number
          chat_credits?: number | null
          created_at?: string
          description?: string | null
          id?: string
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          chat_credits?: number | null
          created_at?: string
          description?: string | null
          id?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_booking_participant: {
        Args: { _booking_id: string; _user_id: string }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { _conv_id: string; _user_id: string }
        Returns: boolean
      }
      is_kyc_verified: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "owner" | "tenant"
      booking_status: "requested" | "confirmed" | "canceled" | "completed"
      furnished_status: "furnished" | "semi-furnished" | "unfurnished"
      kyc_status: "pending" | "verified" | "rejected"
      owner_living: "living_there" | "not_living_there"
      preferred_tenant: "family" | "bachelor" | "female" | "married" | "any"
      transaction_type: "chat_credit" | "commission" | "reward"
      water_facility: "24hr" | "limited" | "tanker"
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
      app_role: ["owner", "tenant"],
      booking_status: ["requested", "confirmed", "canceled", "completed"],
      furnished_status: ["furnished", "semi-furnished", "unfurnished"],
      kyc_status: ["pending", "verified", "rejected"],
      owner_living: ["living_there", "not_living_there"],
      preferred_tenant: ["family", "bachelor", "female", "married", "any"],
      transaction_type: ["chat_credit", "commission", "reward"],
      water_facility: ["24hr", "limited", "tanker"],
    },
  },
} as const
