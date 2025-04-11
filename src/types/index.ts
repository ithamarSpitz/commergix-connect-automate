
// User Types
export type UserRole = 'merchant' | 'admin';
export type PlanType = 'free' | 'paygo' | 'pro';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string | null;
  profile_description: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  plan_type: PlanType;
  created_at: string;
}

// Store Types
export type Platform = 'shopify' | 'mirakl';
export type StoreStatus = 'active' | 'disconnected' | 'error';

export interface Store {
  id: string;
  user_id: string;
  platform: Platform;
  store_name: string;
  domain: string;
  api_key: string | null;
  access_token: string | null;
  status: StoreStatus;
  created_at: string;
}

// Product Types
export interface Product {
  id: string;
  owner_user_id: string;
  store_id: string | null;
  title: string;
  description: string;
  price: number;
  currency: string;
  sku: string;
  is_shared: boolean;
  image_url: string | null;
  created_at: string;
}

export interface ProductListing {
  id: string;
  product_id: string;
  retailer_user_id: string;
  retailer_store_id: string;
  external_product_id: string;
  listing_price: number;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
}

export interface Inventory {
  product_id: string;
  quantity_available: number;
  reserved_quantity: number;
  updated_at: string;
}

// Order Types
export type OrderStatus = 'new' | 'processing' | 'fulfilled' | 'cancelled';
export type FulfillmentStatus = 'unfulfilled' | 'partial' | 'fulfilled' | 'cancelled';

export interface ShippingAddress {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  store_id: string;
  external_order_id: string;
  buyer_name: string;
  buyer_email: string;
  shipping_address: ShippingAddress;
  total_amount: number;
  currency: string;
  order_date: string;
  status: OrderStatus;
  raw_data: any;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_each: number;
  supplier_user_id: string;
  retailer_user_id: string;
  fulfillment_status: FulfillmentStatus;
  tracking_number: string | null;
  tracking_carrier: string | null;
  shipped_at: string | null;
}

// Sync and Usage
export type SyncType = 'products' | 'orders' | 'inventory';
export type SyncStatus = 'success' | 'error' | 'partial';

export interface SyncLog {
  id: string;
  user_id: string;
  type: SyncType;
  details: string;
  status: SyncStatus;
  related_id: string | null;
  timestamp: string;
}

export interface UsageLog {
  user_id: string;
  date: string;
  action_count: number;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}
