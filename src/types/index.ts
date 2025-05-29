
// User Types
export type UserRole = 'merchant' | 'admin';
export type PlanType = 'free' | 'paygo' | 'pro';

export interface User {
  id: string;
  name: string | null;
  role: UserRole;
  plan_type: PlanType;
  profile_description: string | null;
  avatar_url: string | null;
  created_at: string;
}

// Store Types
export type Platform = 'shopify' | 'mirakl' | string;
export type StoreStatus = 'active' | 'pending' | 'disconnected' | 'error' | string;

export interface Store {
  id: string;
  user_id: string;
  platform: Platform;
  store_name: string;
  domain: string | null;
  api_key: string | null;
  access_token: string | null;
  status: StoreStatus;
  created_at: string;
}

// Product Types
export interface Product {
  id: string;
  owner_user_id: string | null;
  store_id: string | null;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  shop_sku: string;
  provider_sku: string;
  is_shared: boolean;
  image_url: string | null;
  inventory: number;
  reference: string | null;
  category: string | null;
  brand: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface Inventory {
  product_id: string;
  quantity_available: number;
  reserved_quantity: number;
  updated_at: string;
}

// Customer Types
export interface Customer {
  id: string;
  external_id: string;
  first_name: string;
  last_name: string;
  phone_number: number;
  city: string | null;
  country: string | null;
  created_at: string;
}

// Order Types
export type OrderStatus = 'new' | 'processing' | 'fulfilled' | 'cancelled' | string;
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
  store_id: string | null;
  owner_user_id: string;
  provider_order_id: string;
  commercial_id: string;
  customer_id: string;
  shipping_address: any; // jsonb type
  billing_address: string | null;
  total_amount: number;
  currency: string;
  order_date: string;
  recieved_date: string | null;
  shipping_date: string | null;
  status: string;
  commission: number | null;
  raw_data: any; // jsonb type
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_each: number;
  supplier_user_id: string | null;
  retailer_user_id: string | null;
  fulfillment_status: FulfillmentStatus;
  tracking_number: string | null;
  tracking_carrier: string | null;
  shipped_at: string | null;
  created_at: string;
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

// Legacy types for backward compatibility (if any components still use these)
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
