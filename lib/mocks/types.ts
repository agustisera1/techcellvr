/** Tipos alineados con DB.sql — solo para mocks y props hasta existan servicios. */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type DeliveryType = "shipping" | "pickup";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentMethod = "whatsapp" | "mercadopago" | "cash";

export type StockMovementType =
  | "sale"
  | "manual_entry"
  | "adjustment"
  | "return"
  | "initial";

export interface MockCategory {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MockCustomer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MockProduct {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  stock_min_threshold: number | null;
  active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface MockProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface MockDiscount {
  id: string;
  product_id: string;
  percentage: number;
  reason: string | null;
  valid_from: string | null;
  valid_until: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MockOrder {
  id: string;
  customer_id: string;
  status: OrderStatus;
  delivery_type: DeliveryType;
  subtotal: number;
  shipping_cost: number;
  discount_total: number;
  total: number;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  mp_payment_id: string | null;
  mp_preference_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MockOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
  discount_applied: number;
  subtotal: number;
  created_at: string;
}

export interface MockPriceHistory {
  id: string;
  product_id: string;
  changed_by: string | null;
  old_price: number;
  new_price: number;
  changed_at: string;
}

export interface MockStockMovement {
  id: string;
  product_id: string;
  moved_by: string | null;
  order_item_id: string | null;
  type: StockMovementType;
  quantity: number;
  stock_before: number;
  stock_after: number;
  reason: string | null;
  created_at: string;
}

export interface MockProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MockSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}
