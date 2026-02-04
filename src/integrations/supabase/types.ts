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
      applications: {
        Row: {
          casting_id: string
          casting_role_id: string | null
          cover_note: string | null
          id: string
          status: string | null
          submitted_at: string
          talent_user_id: string
          updated_at: string
        }
        Insert: {
          casting_id: string
          casting_role_id?: string | null
          cover_note?: string | null
          id?: string
          status?: string | null
          submitted_at?: string
          talent_user_id: string
          updated_at?: string
        }
        Update: {
          casting_id?: string
          casting_role_id?: string | null
          cover_note?: string | null
          id?: string
          status?: string | null
          submitted_at?: string
          talent_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_casting_id_fkey"
            columns: ["casting_id"]
            isOneToOne: false
            referencedRelation: "castings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_casting_role_id_fkey"
            columns: ["casting_role_id"]
            isOneToOne: false
            referencedRelation: "casting_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      audition_bookings: {
        Row: {
          application_id: string | null
          audition_slot_id: string
          created_at: string
          id: string
          status: string | null
          talent_user_id: string
          updated_at: string
        }
        Insert: {
          application_id?: string | null
          audition_slot_id: string
          created_at?: string
          id?: string
          status?: string | null
          talent_user_id: string
          updated_at?: string
        }
        Update: {
          application_id?: string | null
          audition_slot_id?: string
          created_at?: string
          id?: string
          status?: string | null
          talent_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audition_bookings_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audition_bookings_audition_slot_id_fkey"
            columns: ["audition_slot_id"]
            isOneToOne: false
            referencedRelation: "audition_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      audition_events: {
        Row: {
          casting_id: string
          created_at: string
          created_by_user_id: string | null
          end_datetime: string | null
          id: string
          is_virtual: boolean | null
          location_text: string | null
          start_datetime: string | null
          title: string
          type: string | null
          virtual_link_url: string | null
        }
        Insert: {
          casting_id: string
          created_at?: string
          created_by_user_id?: string | null
          end_datetime?: string | null
          id?: string
          is_virtual?: boolean | null
          location_text?: string | null
          start_datetime?: string | null
          title: string
          type?: string | null
          virtual_link_url?: string | null
        }
        Update: {
          casting_id?: string
          created_at?: string
          created_by_user_id?: string | null
          end_datetime?: string | null
          id?: string
          is_virtual?: boolean | null
          location_text?: string | null
          start_datetime?: string | null
          title?: string
          type?: string | null
          virtual_link_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audition_events_casting_id_fkey"
            columns: ["casting_id"]
            isOneToOne: false
            referencedRelation: "castings"
            referencedColumns: ["id"]
          },
        ]
      }
      audition_slots: {
        Row: {
          audition_event_id: string
          capacity: number | null
          end_datetime: string
          id: string
          notes: string | null
          start_datetime: string
        }
        Insert: {
          audition_event_id: string
          capacity?: number | null
          end_datetime: string
          id?: string
          notes?: string | null
          start_datetime: string
        }
        Update: {
          audition_event_id?: string
          capacity?: number | null
          end_datetime?: string
          id?: string
          notes?: string | null
          start_datetime?: string
        }
        Relationships: [
          {
            foreignKeyName: "audition_slots_audition_event_id_fkey"
            columns: ["audition_event_id"]
            isOneToOne: false
            referencedRelation: "audition_events"
            referencedColumns: ["id"]
          },
        ]
      }
      casting_roles: {
        Row: {
          casting_id: string
          created_at: string
          description: string | null
          id: string
          materials_required: string[] | null
          name: string
          requirements_text: string | null
        }
        Insert: {
          casting_id: string
          created_at?: string
          description?: string | null
          id?: string
          materials_required?: string[] | null
          name: string
          requirements_text?: string | null
        }
        Update: {
          casting_id?: string
          created_at?: string
          description?: string | null
          id?: string
          materials_required?: string[] | null
          name?: string
          requirements_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "casting_roles_casting_id_fkey"
            columns: ["casting_id"]
            isOneToOne: false
            referencedRelation: "castings"
            referencedColumns: ["id"]
          },
        ]
      }
      castings: {
        Row: {
          category: string | null
          company_id: string | null
          compensation_amount: number | null
          compensation_type: string | null
          cover_image_url: string | null
          created_at: string
          created_by_user_id: string | null
          currency: string | null
          description: string | null
          end_date: string | null
          id: string
          locations: string[] | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          company_id?: string | null
          compensation_amount?: number | null
          compensation_type?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by_user_id?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          locations?: string[] | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          company_id?: string | null
          compensation_amount?: number | null
          compensation_type?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by_user_id?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          locations?: string[] | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "castings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          contacts_json: Json | null
          created_at: string
          id: string
          location: string | null
          name: string
          notes: string | null
          status: string | null
          tags: string[] | null
          type: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          contacts_json?: Json | null
          created_at?: string
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          status?: string | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          contacts_json?: Json | null
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          status?: string | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      message_participants: {
        Row: {
          id: string
          thread_id: string
          user_id: string
        }
        Insert: {
          id?: string
          thread_id: string
          user_id: string
        }
        Update: {
          id?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_participants_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          application_id: string | null
          casting_id: string | null
          context_type: string | null
          created_at: string
          id: string
        }
        Insert: {
          application_id?: string | null
          casting_id?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
        }
        Update: {
          application_id?: string | null
          casting_id?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_casting_id_fkey"
            columns: ["casting_id"]
            isOneToOne: false
            referencedRelation: "castings"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          sender_user_id: string | null
          thread_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_user_id?: string | null
          thread_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_user_id?: string | null
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: string | null
          id: string
          payload_json: Json | null
          read_at: string | null
          sent_at: string
          type: string
          user_id: string
        }
        Insert: {
          channel?: string | null
          id?: string
          payload_json?: Json | null
          read_at?: string | null
          sent_at?: string
          type: string
          user_id: string
        }
        Update: {
          channel?: string | null
          id?: string
          payload_json?: Json | null
          read_at?: string | null
          sent_at?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          birth_date: string | null
          city: string | null
          country: string | null
          created_at: string
          ethnicity: string | null
          first_name: string | null
          gender: string | null
          id: string
          last_name: string | null
          profile_photo_url: string | null
          updated_at: string
          user_id: string
          visibility_settings: Json | null
        }
        Insert: {
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          ethnicity?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          last_name?: string | null
          profile_photo_url?: string | null
          updated_at?: string
          user_id: string
          visibility_settings?: Json | null
        }
        Update: {
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          ethnicity?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          last_name?: string | null
          profile_photo_url?: string | null
          updated_at?: string
          user_id?: string
          visibility_settings?: Json | null
        }
        Relationships: []
      }
      saved_castings: {
        Row: {
          casting_id: string
          created_at: string
          id: string
          talent_user_id: string
        }
        Insert: {
          casting_id: string
          created_at?: string
          id?: string
          talent_user_id: string
        }
        Update: {
          casting_id?: string
          created_at?: string
          id?: string
          talent_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_castings_casting_id_fkey"
            columns: ["casting_id"]
            isOneToOne: false
            referencedRelation: "castings"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_attributes: {
        Row: {
          availability: Json | null
          clothing_sizes: Json | null
          eye_color: string | null
          hair_color: string | null
          height: number | null
          id: string
          languages: string[] | null
          measurements: string | null
          other_tags: string[] | null
          profile_id: string
          skills: string[] | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          availability?: Json | null
          clothing_sizes?: Json | null
          eye_color?: string | null
          hair_color?: string | null
          height?: number | null
          id?: string
          languages?: string[] | null
          measurements?: string | null
          other_tags?: string[] | null
          profile_id: string
          skills?: string[] | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          availability?: Json | null
          clothing_sizes?: Json | null
          eye_color?: string | null
          hair_color?: string | null
          height?: number | null
          id?: string
          languages?: string[] | null
          measurements?: string | null
          other_tags?: string[] | null
          profile_id?: string
          skills?: string[] | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "talent_attributes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "talent" | "owner" | "admin"
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
      app_role: ["talent", "owner", "admin"],
    },
  },
} as const
