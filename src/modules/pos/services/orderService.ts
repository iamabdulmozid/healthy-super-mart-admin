// src/modules/pos/services/orderService.ts
import { apiClient } from '@/lib/api-client';
import type { CartItem } from '@/context/CartContext';

// Types based on the API response
export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  priceAtOrderTime: string;
  subtotal: string;
  product: {
    id: number;
    name: string;
    image: string;
    weight: string;
  };
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
  status: string;
  orderSource: string;
  paymentMethod: 'cash' | 'card';
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  shop: Shop;
}

export interface CheckoutRequest {
  userId: number;
  shopId: number;
  locationCode: string;
  orderSource: string;
  paymentMethod: 'cash' | 'card';
  items: {
    productId: number;
    quantity: number;
  }[];
}

export interface CheckoutResponse {
  order: Order;
  message: string;
}

export class OrderService {
  private readonly baseUrl = '/orders';

  /**
   * Convert cart items to checkout request format
   */
  private formatCheckoutItems(cartItems: CartItem[]) {
    return cartItems.map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    }));
  }

  /**
   * Checkout order with cart items
   */
  async checkout(
    cartItems: CartItem[],
    options: {
      userId?: number;
      shopId?: number;
      locationCode?: string;
      orderSource?: string;
      paymentMethod: 'cash' | 'card';
    }
  ): Promise<CheckoutResponse> {
    const {
      userId = 1, // Default user ID - should come from auth context
      shopId = 1, // Default shop ID - should be configurable
      locationCode = 'POS', // Default location - should be configurable
      orderSource = 'pos', // POS system source
      paymentMethod
    } = options;

    const checkoutData: CheckoutRequest = {
      userId,
      shopId,
      locationCode,
      orderSource,
      paymentMethod,
      items: this.formatCheckoutItems(cartItems)
    };

    try {
      const response = await apiClient.post<CheckoutResponse>(
        `${this.baseUrl}/checkout`,
        checkoutData
      );
      return response;
    } catch (error) {
      console.error('Checkout failed:', error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: number): Promise<Order> {
    try {
      const response = await apiClient.get<{ order: Order }>(`${this.baseUrl}/${orderId}`);
      return response.order;
    } catch (error) {
      console.error('Failed to get order:', error);
      throw error;
    }
  }

  /**
   * Get orders list with pagination
   */
  async getOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<{ orders: Order[]; total: number; page: number; limit: number }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}`, { params });
      return response;
    } catch (error) {
      console.error('Failed to get orders:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const orderService = new OrderService();
export default orderService;