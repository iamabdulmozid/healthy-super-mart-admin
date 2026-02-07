// src/modules/admin/services/categoryService.ts
import { apiClient } from '@/lib/api-client';
import type { 
  Category, 
  CategoryFilters, 
  CategoryListResponse, 
  CreateCategoryRequest, 
  CategoryResponse 
} from '@/types/category';

export class CategoryService {
  private readonly baseEndpoint = '/categories';

  async getAllCategories(filters: CategoryFilters = {}): Promise<CategoryListResponse> {
    const params = new URLSearchParams();
    
    // Add filters to query params
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    // Only add parentCategoryId if it's a valid number (not null or undefined)
    if (filters.parentCategoryId !== undefined && filters.parentCategoryId !== null) {
      params.append('parentCategoryId', filters.parentCategoryId.toString());
    }
    if (filters.isFeatured !== undefined) params.append('isFeatured', filters.isFeatured.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.includeChildren !== undefined) params.append('includeChildren', filters.includeChildren.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const url = `${this.baseEndpoint}/admin/all${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<CategoryListResponse>(url);
    return response;
  }

  async getCategoryById(id: number): Promise<Category> {
    const response = await apiClient.get<CategoryResponse>(`${this.baseEndpoint}/${id}`);
    return response.data;
  }

  async createCategory(categoryData: CreateCategoryRequest): Promise<Category> {
    const response = await apiClient.post<CategoryResponse>(this.baseEndpoint, categoryData);
    return response.data;
  }

  async updateCategory(id: number, categoryData: Partial<CreateCategoryRequest>): Promise<Category> {
    const response = await apiClient.patch<CategoryResponse>(`${this.baseEndpoint}/${id}`, categoryData);
    return response.data;
  }

  async deleteCategory(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`${this.baseEndpoint}/${id}`);
    return response;
  }

  async getParentCategories(): Promise<Category[]> {
    const response = await apiClient.get<{ success: boolean; message: string; data: Category[] }>(`${this.baseEndpoint}/roots`);
    return response.data;
  }

  async getCategoryChildren(parentId: number): Promise<Category[]> {
    const response = await apiClient.get<{ success: boolean; message: string; data: Category[] }>(`${this.baseEndpoint}/${parentId}/subcategories`);
    return response.data;
  }
}

export const categoryService = new CategoryService();