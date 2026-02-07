import { apiClient } from '@/lib/api-client';
import type { Shop } from '@/types/shop';

export class ShopService {
  private readonly baseEndpoint = '/admin/shops';

  async getAllShops(): Promise<Shop[]> {
    const response = await apiClient.get<Shop[]>(this.baseEndpoint);
    return response;
  }

  async getActiveShops(): Promise<Shop[]> {
    const shops = await this.getAllShops();
    return shops.filter(shop => shop.status === 'active');
  }
}

export const shopService = new ShopService();
