import type {
  MockCategory,
  MockCustomer,
  MockDiscount,
  MockOrder,
  MockOrderItem,
  MockPriceHistory,
  MockProduct,
  MockProductImage,
  MockProfile,
  MockSetting,
  MockStockMovement,
} from "./types";

const T = "2025-01-15T12:00:00.000Z";

export const mockCategories: MockCategory[] = [
  {
    id: "c1111111-1111-4111-8111-111111111101",
    parent_id: null,
    name: "Celulares",
    slug: "celulares",
    description: "Smartphones y accesorios",
    sort_order: 0,
    active: true,
    created_at: T,
    updated_at: T,
  },
  {
    id: "c2222222-2222-4222-8222-222222222202",
    parent_id: "c1111111-1111-4111-8111-111111111101",
    name: "Android",
    slug: "android",
    description: "Equipos Android",
    sort_order: 0,
    active: true,
    created_at: T,
    updated_at: T,
  },
  {
    id: "c3333333-3333-4333-8333-333333333303",
    parent_id: null,
    name: "Accesorios",
    slug: "accesorios",
    description: "Cargadores, fundas",
    sort_order: 1,
    active: true,
    created_at: T,
    updated_at: T,
  },
];

export const mockCustomers: MockCustomer[] = [
  {
    id: "u1111111-1111-4111-8111-111111111201",
    name: "María González",
    phone: "5491112345678",
    email: "maria@example.com",
    address: "Av. Corrientes 1234",
    city: "CABA",
    notes: null,
    created_at: T,
    updated_at: T,
  },
  {
    id: "u2222222-2222-4222-8222-222222222202",
    name: "Juan Pérez",
    phone: "5491198765432",
    email: null,
    address: null,
    city: "La Plata",
    notes: "Prefiere retiro en local",
    created_at: T,
    updated_at: T,
  },
];

export const mockProducts: MockProduct[] = [
  {
    id: "p1111111-1111-4111-8111-111111111301",
    category_id: "c2222222-2222-4222-8222-222222222202",
    name: "Samsung Galaxy A54",
    slug: "samsung-galaxy-a54",
    description: "128GB, excelente batería",
    sku: "SAM-A54-128",
    price: 349999,
    compare_at_price: 399999,
    stock: 12,
    stock_min_threshold: 5,
    active: true,
    featured: true,
    created_at: T,
    updated_at: T,
  },
  {
    id: "p2222222-2222-4222-8222-222222222302",
    category_id: "c2222222-2222-4222-8222-222222222202",
    name: "Motorola Edge 40",
    slug: "motorola-edge-40",
    description: "Pantalla OLED",
    sku: "MOT-EDGE40",
    price: 289000,
    compare_at_price: null,
    stock: 3,
    stock_min_threshold: 5,
    active: true,
    featured: false,
    created_at: T,
    updated_at: T,
  },
  {
    id: "p3333333-3333-4333-8333-333333333303",
    category_id: "c3333333-3333-4333-8333-333333333303",
    name: "Cargador USB-C 25W",
    slug: "cargador-usbc-25w",
    description: null,
    sku: "ACC-USBC-25",
    price: 12000,
    compare_at_price: null,
    stock: 45,
    stock_min_threshold: 10,
    active: true,
    featured: false,
    created_at: T,
    updated_at: T,
  },
  {
    id: "p4444444-4444-4444-8444-444444444404",
    category_id: "c1111111-1111-4111-8111-111111111101",
    name: "iPhone 13 reacondicionado",
    slug: "iphone-13-refurb",
    description: "Grado A, batería 90%",
    sku: "APL-IP13-128-R",
    price: 520000,
    compare_at_price: 580000,
    stock: 0,
    stock_min_threshold: 2,
    active: true,
    featured: true,
    created_at: T,
    updated_at: T,
  },
];

export const mockProductImages: MockProductImage[] = [
  {
    id: "i1111111-1111-4111-8111-111111111401",
    product_id: "p1111111-1111-4111-8111-111111111301",
    url: "https://placehold.co/400x400/e2e8f0/64748b?text=A54",
    alt_text: "Samsung Galaxy A54",
    sort_order: 0,
    is_primary: true,
    created_at: T,
  },
  {
    id: "i2222222-2222-4222-8222-222222222402",
    product_id: "p2222222-2222-4222-8222-222222222302",
    url: "https://placehold.co/400x400/e2e8f0/64748b?text=Edge40",
    alt_text: "Motorola Edge 40",
    sort_order: 0,
    is_primary: true,
    created_at: T,
  },
  {
    id: "i3333333-3333-4333-8333-333333333503",
    product_id: "p3333333-3333-4333-8333-333333333303",
    url: "https://placehold.co/400x400/e2e8f0/64748b?text=USB-C",
    alt_text: "Cargador",
    sort_order: 0,
    is_primary: true,
    created_at: T,
  },
];

export const mockDiscounts: MockDiscount[] = [
  {
    id: "d1111111-1111-4111-8111-111111111501",
    product_id: "p1111111-1111-4111-8111-111111111301",
    percentage: 10,
    reason: "Lanzamiento",
    valid_from: "2025-01-01T00:00:00.000Z",
    valid_until: "2025-03-31T23:59:59.000Z",
    active: true,
    created_at: T,
    updated_at: T,
  },
];

export const mockOrders: MockOrder[] = [
  {
    id: "o1111111-1111-4111-8111-111111111601",
    customer_id: "u1111111-1111-4111-8111-111111111201",
    status: "pending",
    delivery_type: "shipping",
    subtotal: 349999,
    shipping_cost: 5000,
    discount_total: 35000,
    total: 319999,
    payment_status: "pending",
    payment_method: "whatsapp",
    mp_payment_id: null,
    mp_preference_id: null,
    notes: null,
    created_at: "2025-03-18T10:30:00.000Z",
    updated_at: "2025-03-18T10:30:00.000Z",
  },
  {
    id: "o2222222-2222-4222-8222-222222222602",
    customer_id: "u2222222-2222-4222-8222-222222222202",
    status: "confirmed",
    delivery_type: "pickup",
    subtotal: 12000,
    shipping_cost: 0,
    discount_total: 0,
    total: 12000,
    payment_status: "paid",
    payment_method: "cash",
    mp_payment_id: null,
    mp_preference_id: null,
    notes: "Retira viernes",
    created_at: "2025-03-19T14:00:00.000Z",
    updated_at: "2025-03-19T15:00:00.000Z",
  },
  {
    id: "o3333333-3333-4333-8333-333333333703",
    customer_id: "u1111111-1111-4111-8111-111111111201",
    status: "delivered",
    delivery_type: "shipping",
    subtotal: 289000,
    shipping_cost: 0,
    discount_total: 0,
    total: 289000,
    payment_status: "paid",
    payment_method: "mercadopago",
    mp_payment_id: "MP-123456",
    mp_preference_id: "pref-abc",
    notes: null,
    created_at: "2025-03-10T09:00:00.000Z",
    updated_at: "2025-03-12T16:00:00.000Z",
  },
];

export const mockOrderItems: MockOrderItem[] = [
  {
    id: "oi111111-1111-4111-8111-111111111701",
    order_id: "o1111111-1111-4111-8111-111111111601",
    product_id: "p1111111-1111-4111-8111-111111111301",
    product_name: "Samsung Galaxy A54",
    product_sku: "SAM-A54-128",
    quantity: 1,
    unit_price: 349999,
    discount_applied: 35000,
    subtotal: 314999,
    created_at: "2025-03-18T10:30:00.000Z",
  },
  {
    id: "oi222222-2222-4222-8222-222222222702",
    order_id: "o2222222-2222-4222-8222-222222222602",
    product_id: "p3333333-3333-4333-8333-333333333303",
    product_name: "Cargador USB-C 25W",
    product_sku: "ACC-USBC-25",
    quantity: 1,
    unit_price: 12000,
    discount_applied: 0,
    subtotal: 12000,
    created_at: "2025-03-19T14:00:00.000Z",
  },
  {
    id: "oi333333-3333-4333-8333-333333333803",
    order_id: "o3333333-3333-4333-8333-333333333703",
    product_id: "p2222222-2222-4222-8222-222222222302",
    product_name: "Motorola Edge 40",
    product_sku: "MOT-EDGE40",
    quantity: 1,
    unit_price: 289000,
    discount_applied: 0,
    subtotal: 289000,
    created_at: "2025-03-10T09:00:00.000Z",
  },
];

export const mockPriceHistory: MockPriceHistory[] = [
  {
    id: "ph111111-1111-4111-8111-111111111801",
    product_id: "p1111111-1111-4111-8111-111111111301",
    changed_by: "a1111111-1111-4111-8111-111111111901",
    old_price: 379999,
    new_price: 349999,
    changed_at: "2025-02-01T11:00:00.000Z",
  },
];

export const mockStockMovements: MockStockMovement[] = [
  {
    id: "sm111111-1111-4111-8111-111111112001",
    product_id: "p3333333-3333-4333-8333-333333333303",
    moved_by: "a1111111-1111-4111-8111-111111111901",
    order_item_id: "oi222222-2222-4222-8222-222222222702",
    type: "sale",
    quantity: -1,
    stock_before: 46,
    stock_after: 45,
    reason: null,
    created_at: "2025-03-19T14:00:00.000Z",
  },
  {
    id: "sm222222-2222-4222-8222-222222222002",
    product_id: "p2222222-2222-4222-8222-222222222302",
    moved_by: null,
    order_item_id: null,
    type: "manual_entry",
    quantity: 5,
    stock_before: 0,
    stock_after: 5,
    reason: "Ingreso proveedor",
    created_at: "2025-03-01T08:00:00.000Z",
  },
];

export const mockProfiles: MockProfile[] = [
  {
    id: "a1111111-1111-4111-8111-111111111901",
    email: "admin@techcell.local",
    full_name: "Admin Techcell",
    avatar_url: null,
    role: "admin",
    active: true,
    created_at: T,
    updated_at: T,
  },
];

export const mockSettings: MockSetting[] = [
  {
    id: "s1111111-1111-4111-8111-111111112101",
    key: "business_name",
    value: "Techcell",
    description: "Nombre del negocio",
    created_at: T,
    updated_at: T,
  },
  {
    id: "s2222222-2222-4222-8222-222222222102",
    key: "business_hours",
    value: "Lun–Vie 9–18h, Sáb 10–14h",
    description: "Horarios de atención",
    created_at: T,
    updated_at: T,
  },
  {
    id: "s3333333-3333-4333-8333-333333333103",
    key: "shipping_flat",
    value: "5000",
    description: "Costo envío fijo (ARS)",
    created_at: T,
    updated_at: T,
  },
];

/** Productos con stock <= umbral (para banner / tablas). */
export function getLowStockProducts(
  products: MockProduct[] = mockProducts,
): MockProduct[] {
  return products.filter(
    (p) => p.stock <= (p.stock_min_threshold ?? 0) && p.active,
  );
}

/** Categoría por id (mock). */
export function categoryNameById(id: string | null): string {
  if (!id) return "—";
  return mockCategories.find((c) => c.id === id)?.name ?? "—";
}
