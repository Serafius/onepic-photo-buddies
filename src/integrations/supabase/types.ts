export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      booking_requests: {
        Row: {
          category_id: string | null
          client_id: string | null
          created_at: string
          id: string
          message: string | null
          photographer_id: string | null
          status: string | null
        }
        Insert: {
          category_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          photographer_id?: string | null
          status?: string | null
        }
        Update: {
          category_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          photographer_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "photographer_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_requests_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
        ]
      }
      Clients: {
        Row: {
          city: string
          country: string
          email: string
          id: number
          location: string
          made_at: string
          name: string
          password: string
          username: string
        }
        Insert: {
          city: string
          country: string
          email?: string
          id?: number
          location: string
          made_at?: string
          name?: string
          password: string
          username?: string
        }
        Update: {
          city?: string
          country?: string
          email?: string
          id?: number
          location?: string
          made_at?: string
          name?: string
          password?: string
          username?: string
        }
        Relationships: []
      }
      Comments: {
        Row: {
          id: number
          likes: number
          made_at: string
          name: string
          post_id: number
          text: string
          user_id: number
          user_type: string | null
        }
        Insert: {
          id?: number
          likes?: number
          made_at?: string
          name: string
          post_id: number
          text: string
          user_id: number
          user_type?: string | null
        }
        Update: {
          id?: number
          likes?: number
          made_at?: string
          name?: string
          post_id?: number
          text?: string
          user_id?: number
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "Posts"
            referencedColumns: ["id"]
          },
        ]
      }
      photographer_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          photographer_id: string | null
          price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          photographer_id?: string | null
          price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          photographer_id?: string | null
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "photographer_categories_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
        ]
      }
      photographers: {
        Row: {
          bio: string | null
          city: string | null
          created_at: string
          hourly_rate: number
          id: string
          location: string | null
          name: string
          rating: number | null
          specialty: string | null
          state: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          city?: string | null
          created_at?: string
          hourly_rate: number
          id?: string
          location?: string | null
          name: string
          rating?: number | null
          specialty?: string | null
          state?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          city?: string | null
          created_at?: string
          hourly_rate?: number
          id?: string
          location?: string | null
          name?: string
          rating?: number | null
          specialty?: string | null
          state?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      Photographers: {
        Row: {
          bio: string | null
          city: string
          country: string
          email: string
          id: number
          location: string
          made_at: string
          name: string
          password: string
          profession: string
          profile_picture_url: string | null
          username: string
        }
        Insert: {
          bio?: string | null
          city: string
          country: string
          email?: string
          id?: number
          location: string
          made_at?: string
          name?: string
          password: string
          profession: string
          profile_picture_url?: string | null
          username?: string
        }
        Update: {
          bio?: string | null
          city?: string
          country?: string
          email?: string
          id?: number
          location?: string
          made_at?: string
          name?: string
          password?: string
          profession?: string
          profile_picture_url?: string | null
          username?: string
        }
        Relationships: []
      }
      portfolio_images: {
        Row: {
          category_name: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string
          photographer_id: string | null
          title: string | null
        }
        Insert: {
          category_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          photographer_id?: string | null
          title?: string | null
        }
        Update: {
          category_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          photographer_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_images_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_posts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_featured: boolean | null
          likes_count: number | null
          location: string | null
          photographer_id: string
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          location?: string | null
          photographer_id: string
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          location?: string | null
          photographer_id?: string
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_posts_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "photographers"
            referencedColumns: ["id"]
          },
        ]
      }
      post_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          order_index: number | null
          post_id: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          order_index?: number | null
          post_id?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          order_index?: number | null
          post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_images_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "portfolio_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      Posts: {
        Row: {
          id: number
          likes: number
          location: string | null
          made_at: string
          photographer_id: number
          photos: string[]
          text: string
        }
        Insert: {
          id?: number
          likes?: number
          location?: string | null
          made_at?: string
          photographer_id: number
          photos: string[]
          text: string
        }
        Update: {
          id?: number
          likes?: number
          location?: string | null
          made_at?: string
          photographer_id?: number
          photos?: string[]
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "Posts_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "Photographers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      Sessions: {
        Row: {
          category: string
          city: string
          client_id: number
          country: string
          date: string
          description: string | null
          id: number
          location: string
          made_at: string
          photographer_id: number
          status: Database["public"]["Enums"]["session_status"]
        }
        Insert: {
          category: string
          city: string
          client_id: number
          country: string
          date: string
          description?: string | null
          id?: number
          location: string
          made_at?: string
          photographer_id: number
          status: Database["public"]["Enums"]["session_status"]
        }
        Update: {
          category?: string
          city?: string
          client_id?: number
          country?: string
          date?: string
          description?: string | null
          id?: number
          location?: string
          made_at?: string
          photographer_id?: number
          status?: Database["public"]["Enums"]["session_status"]
        }
        Relationships: [
          {
            foreignKeyName: "Sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "Clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Sessions_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "Photographers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_likes: {
        Row: {
          created_at: string
          id: string
          image_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_likes_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "portfolio_images"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      session_status: "accepted" | "pending" | "rejected"
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
      session_status: ["accepted", "pending", "rejected"],
    },
  },
} as const
