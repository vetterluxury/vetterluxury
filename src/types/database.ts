// ============================================================
// Tipos que espelham as tabelas do Supabase (supabase/schema.sql).
// Se alterar o schema, atualize estes tipos também.
// ============================================================

export type ProductStatus = 'active' | 'inactive' | 'draft';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  banner_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  sku_variant: string | null;
  inventory?: { quantity: number; low_stock_threshold: number } | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  additional_info: string | null;
  price: number;
  promo_price: number | null;
  sku: string | null;
  category_id: string | null;
  collection_id: string | null;
  sizes: string[];
  colors: string[];
  main_image_url: string | null;
  status: ProductStatus;
  is_featured: boolean;
  is_new: boolean;
  is_on_sale: boolean;
  created_at: string;
  updated_at: string;
  // relações opcionais preenchidas via join
  category?: Category | null;
  collection?: Collection | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  cpf: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  profile_id: string;
  label: string;
  recipient_name: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
}

export type PaymentMethod = 'pix' | 'credit_card' | 'cash';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded';
export type OrderStatus =
  | 'payment_pending'
  | 'payment_approved'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  size: string | null;
  color: string | null;
  unit_price: number;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  profile_id: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon_id: string | null;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  shipping_address: Record<string, unknown> | null;
  tracking_code: string | null;
  mp_payment_id: string | null;
  mp_preference_id: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  usage_limit: number | null;
}

export interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  placement: 'home' | 'collection' | 'category';
  display_order: number;
  is_active: boolean;
}

// Item do carrinho no cliente (localStorage / contexto React)
export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  price: number;
  promoPrice: number | null;
  image: string | null;
  size: string;
  color: string;
  quantity: number;
}
