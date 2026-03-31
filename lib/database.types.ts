/**
 * TypeScript types for the TechCell Supabase database.
 *
 * Generated manually from supabase/migrations/0001_schema.sql.
 * Regenerate with the Supabase CLI once a project is linked:
 *   npx supabase gen types typescript --project-id <id> > lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ─── Enum-like union types ────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type PaymentMethod = 'whatsapp' | 'mercadopago' | 'cash'

export type DeliveryType = 'shipping' | 'pickup'

export type StockMovementType =
  | 'sale'
  | 'manual_entry'
  | 'adjustment'
  | 'return'
  | 'initial'

// ─── Database schema ─────────────────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          parent_id: string | null
          name: string
          slug: string
          description: string | null
          sort_order: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id?: string | null
          name: string
          slug: string
          description?: string | null
          sort_order?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_id?: string | null
          name?: string
          slug?: string
          description?: string | null
          sort_order?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          phone: string
          email: string | null
          address: string | null
          city: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email?: string | null
          address?: string | null
          city?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string | null
          address?: string | null
          city?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      discounts: {
        Row: {
          id: string
          product_id: string
          percentage: number
          reason: string | null
          valid_from: string | null
          valid_until: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          percentage: number
          reason?: string | null
          valid_from?: string | null
          valid_until?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          percentage?: number
          reason?: string | null
          valid_from?: string | null
          valid_until?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_sku: string | null
          quantity: number
          unit_price: number
          discount_applied: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_sku?: string | null
          quantity: number
          unit_price: number
          discount_applied?: number
          subtotal: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number
          unit_price?: number
          discount_applied?: number
          subtotal?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string
          status: OrderStatus
          delivery_type: DeliveryType
          delivery_address: string | null
          subtotal: number
          shipping_cost: number
          discount_total: number
          total: number
          payment_status: PaymentStatus
          payment_method: PaymentMethod | null
          mp_payment_id: string | null
          mp_preference_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          customer_id: string
          status?: OrderStatus
          delivery_type?: DeliveryType
          delivery_address?: string | null
          subtotal?: number
          shipping_cost?: number
          discount_total?: number
          total?: number
          payment_status?: PaymentStatus
          payment_method?: PaymentMethod | null
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string
          status?: OrderStatus
          delivery_type?: DeliveryType
          delivery_address?: string | null
          subtotal?: number
          shipping_cost?: number
          discount_total?: number
          total?: number
          payment_status?: PaymentStatus
          payment_method?: PaymentMethod | null
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      price_history: {
        Row: {
          id: string
          product_id: string
          changed_by: string | null
          old_price: number
          new_price: number
          changed_at: string
        }
        Insert: {
          id?: string
          product_id: string
          changed_by?: string | null
          old_price: number
          new_price: number
          changed_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          changed_by?: string | null
          old_price?: number
          new_price?: number
          changed_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text: string | null
          sort_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt_text?: string | null
          sort_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          url?: string
          alt_text?: string | null
          sort_order?: number
          is_primary?: boolean
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          category_id: string | null
          name: string
          slug: string
          description: string | null
          sku: string | null
          price: number
          compare_at_price: number | null
          stock: number
          stock_min_threshold: number | null
          active: boolean
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          name: string
          slug: string
          description?: string | null
          sku?: string | null
          price: number
          compare_at_price?: number | null
          stock?: number
          stock_min_threshold?: number | null
          active?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string | null
          name?: string
          slug?: string
          description?: string | null
          sku?: string | null
          price?: number
          compare_at_price?: number | null
          stock?: number
          stock_min_threshold?: number | null
          active?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          role: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      stock_movements: {
        Row: {
          id: string
          product_id: string
          moved_by: string | null
          order_item_id: string | null
          type: StockMovementType
          quantity: number
          stock_before: number
          stock_after: number
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          moved_by?: string | null
          order_item_id?: string | null
          type: StockMovementType
          quantity: number
          stock_before: number
          stock_after: number
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          moved_by?: string | null
          order_item_id?: string | null
          type?: StockMovementType
          quantity?: number
          stock_before?: number
          stock_after?: number
          reason?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      immutable_unaccent: {
        Args: { '': string }
        Returns: string
      }
    }
    Enums: Record<string, never>
  }
}

// ─── Convenience type aliases ─────────────────────────────────────────────────

/** Row type for a given table. */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

/** Insert type for a given table. */
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

/** Update type for a given table. */
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
