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
      customers: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          external_id: string
          first_name: string
          id: string
          last_name: string
          phone_number: number
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          external_id: string
          first_name: string
          id?: string
          last_name: string
          phone_number: number
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          external_id?: string
          first_name?: string
          id?: string
          last_name?: string
          phone_number?: number
        }
        Relationships: []
      }
      inventory: {
        Row: {
          product_id: string
          quantity_available: number
          reserved_quantity: number
          updated_at: string
        }
        Insert: {
          product_id: string
          quantity_available?: number
          reserved_quantity?: number
          updated_at?: string
        }
        Update: {
          product_id?: string
          quantity_available?: number
          reserved_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          fulfillment_status: string
          id: string
          order_id: string
          price_each: number
          product_id: string
          quantity: number
          retailer_user_id: string | null
          shipped_at: string | null
          supplier_user_id: string | null
          tracking_carrier: string | null
          tracking_number: string | null
        }
        Insert: {
          created_at?: string
          fulfillment_status?: string
          id?: string
          order_id: string
          price_each: number
          product_id: string
          quantity: number
          retailer_user_id?: string | null
          shipped_at?: string | null
          supplier_user_id?: string | null
          tracking_carrier?: string | null
          tracking_number?: string | null
        }
        Update: {
          created_at?: string
          fulfillment_status?: string
          id?: string
          order_id?: string
          price_each?: number
          product_id?: string
          quantity?: number
          retailer_user_id?: string | null
          shipped_at?: string | null
          supplier_user_id?: string | null
          tracking_carrier?: string | null
          tracking_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: string | null
          commercial_id: string
          commission: number | null
          created_at: string
          currency: string
          customer_id: string
          id: string
          order_date: string
          owner_user_id: string
          provider_order_id: string
          raw_data: Json | null
          recieved_date: string | null
          shipping_address: Json
          shipping_date: string | null
          status: string
          store_id: string | null
          total_amount: number
        }
        Insert: {
          billing_address?: string | null
          commercial_id: string
          commission?: number | null
          created_at?: string
          currency?: string
          customer_id: string
          id?: string
          order_date: string
          owner_user_id?: string
          provider_order_id: string
          raw_data?: Json | null
          recieved_date?: string | null
          shipping_address: Json
          shipping_date?: string | null
          status: string
          store_id?: string | null
          total_amount: number
        }
        Update: {
          billing_address?: string | null
          commercial_id?: string
          commission?: number | null
          created_at?: string
          currency?: string
          customer_id?: string
          id?: string
          order_date?: string
          owner_user_id?: string
          provider_order_id?: string
          raw_data?: Json | null
          recieved_date?: string | null
          shipping_address?: Json
          shipping_date?: string | null
          status?: string
          store_id?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["external_id"]
          },
          {
            foreignKeyName: "orders_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          image_url: string | null
          inventory: number
          is_shared: boolean
          owner_user_id: string | null
          price: number
          provider_sku: string
          reference: string | null
          shop_sku: string
          store_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          brand?: string | null
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          inventory?: number
          is_shared?: boolean
          owner_user_id?: string | null
          price: number
          provider_sku: string
          reference?: string | null
          shop_sku: string
          store_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          brand?: string | null
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          inventory?: number
          is_shared?: boolean
          owner_user_id?: string | null
          price?: number
          provider_sku?: string
          reference?: string | null
          shop_sku?: string
          store_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          access_token: string | null
          api_key: string | null
          created_at: string
          domain: string | null
          id: string
          platform: string
          status: string
          store_name: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          api_key?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          platform: string
          status?: string
          store_name: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          api_key?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          platform?: string
          status?: string
          store_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          details: string
          id: string
          related_id: string | null
          status: string
          timestamp: string
          type: string
          user_id: string
        }
        Insert: {
          details: string
          id?: string
          related_id?: string | null
          status: string
          timestamp?: string
          type: string
          user_id: string
        }
        Update: {
          details?: string
          id?: string
          related_id?: string | null
          status?: string
          timestamp?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_log: {
        Row: {
          action_count: number
          date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_count?: number
          date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_count?: number
          date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string | null
          plan_type: string
          profile_description: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          name?: string | null
          plan_type?: string
          profile_description?: string | null
          role?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          plan_type?: string
          profile_description?: string | null
          role?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
