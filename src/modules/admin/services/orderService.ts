// src/modules/admin/services/orderService.ts
import { apiClient } from '@/lib/api-client';
import type { Order, UpdateOrderRequest, OrderSummary, SummaryPreset, OrderStats, OrdersResponse } from '@/types/order';

export class OrderService {
  private static readonly BASE_PATH = '/orders';

  static async getOrders(page: number = 1, limit: number = 10): Promise<OrdersResponse> {
    return apiClient.get<OrdersResponse>(`${this.BASE_PATH}?page=${page}&limit=${limit}`);
  }

  static async getAllOrders(): Promise<Order[]> {
    const response = await this.getOrders(1, 1000); // Get a large number for legacy compatibility
    return response.orders;
  }

  static async getOrderById(id: number): Promise<Order> {
    return apiClient.get<Order>(`${this.BASE_PATH}/${id}`);
  }

  static async updateOrderStatus(updateData: UpdateOrderRequest): Promise<Order> {
    return apiClient.patch<Order>(`${this.BASE_PATH}/${updateData.id}/status`, {
      status: updateData.status
    });
  }

  static async deleteOrder(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_PATH}/${id}`);
  }

  static async getOrdersSummary(preset: SummaryPreset = 'this_week'): Promise<OrderSummary> {
    return apiClient.get<OrderSummary>(`${this.BASE_PATH}/summary?preset=${preset}`);
  }

  static async getOrderStats(): Promise<OrderStats> {
    return apiClient.get<OrderStats>(`${this.BASE_PATH}/stats`);
  }
}

export default OrderService;