// src/modules/admin/services/productTagService.ts
import apiClient from '@/lib/api-client';
import type { ProductTagListResponse } from '@/types/product';

export const productTagService = {
  async getActiveTags(): Promise<ProductTagListResponse> {
    const response = await apiClient.get<ProductTagListResponse>(
      '/product-category-tags?page=1&limit=50&isActive=true&sortBy=sortOrder&sortOrder=ASC'
    );
    return response;
  },
};
