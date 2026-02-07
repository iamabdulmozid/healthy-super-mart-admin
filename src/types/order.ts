// src/types/order.ts
export interface Product {
  id: number;
  name: string;
  image: string;
  weight: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  priceAtOrderTime: string;
  subtotal: string;
  product: Product;
}

export interface Shop {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface Order {
  id: number;
  userId: number;
  shopId: number;
  locationCode: string;
  total: string;
  weight: string;
  shippingCost: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';
  orderSource: 'pos' | 'online';
  paymentMethod: 'cash' | 'card';
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  shop: Shop;
}

export interface OrderFilters {
  status: string;
  orderSource: string;
  search: string;
}

export interface UpdateOrderRequest {
  id: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';
}

export interface OrderSummary {
  total_orders: number;
  total_sales: number;
  total_items_sold: number;
}

export type SummaryPreset = 'today' | 'yesterday' | 'this_week' | 'last_30_days' | 'all_time';

export interface OrderStats {
  totalOrders: number;
  todayOrders: number;
  weekOrders: number;
  monthOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}