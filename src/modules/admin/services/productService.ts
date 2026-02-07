// src/modules/admin/services/productService.ts
import { apiClient } from '@/lib/api-client';
import type { 
  Product,
  ProductFilters,
  ProductListResponse,
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  DeleteProductResponse,
  ProductAutocompleteResponse
} from '@/types/product';

export class ProductService {
  private readonly baseEndpoint = '/products';

  async getAllProducts(filters: ProductFilters = {}): Promise<ProductListResponse> {
    const params = new URLSearchParams();
    
    // Add filters to query params
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.lowQuantity) params.append('lowQuantity', 'true');
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.includeShopInventory !== undefined) {
      params.append('includeShopInventory', filters.includeShopInventory.toString());
    }

    const queryString = params.toString();
    const url = `${this.baseEndpoint}${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<ProductListResponse>(url);
    return response;
  }

  async getProductById(id: number, includeShopInventory = false): Promise<Product> {
    const params = includeShopInventory ? '?includeShopInventory=true' : '';
    const response = await apiClient.get<ProductResponse>(`${this.baseEndpoint}/${id}${params}`);
    return response.data;
  }

  async createProduct(productData: CreateProductRequest): Promise<Product> {
    const response = await apiClient.post<ProductResponse>(this.baseEndpoint, productData);
    return response.data;
  }

  async createMultiShopProduct(productData: CreateProductRequest): Promise<{ statusCode: number; message: string }> {
    const response = await apiClient.post<{ statusCode: number; message: string }>(`${this.baseEndpoint}/multi-shops`, productData);
    return response;
  }

  async updateProduct(id: number, productData: UpdateProductRequest): Promise<Product> {
    const response = await apiClient.put<ProductResponse>(`${this.baseEndpoint}/${id}`, productData);
    return response.data;
  }

  async deleteProduct(id: number): Promise<DeleteProductResponse> {
    const response = await apiClient.delete<DeleteProductResponse>(`${this.baseEndpoint}/${id}`);
    return response;
  }

  // Helper method to get products by category
  async getProductsByCategory(categoryId: number, filters: Omit<ProductFilters, 'categoryId'> = {}): Promise<ProductListResponse> {
    return this.getAllProducts({ ...filters, categoryId });
  }

  // Helper method to get featured products
  async getFeaturedProducts(limit = 10): Promise<Product[]> {
    const response = await this.getAllProducts({ limit });
    return response.data.products.filter(product => product.isFeatured);
  }

  // Helper method to search products
  async searchProducts(query: string, filters: Omit<ProductFilters, 'search'> = {}): Promise<ProductListResponse> {
    return this.getAllProducts({ ...filters, search: query });
  }

  // Barcode-related methods
  async generateBarcodeForProduct(id: number): Promise<{ barcode: string }> {
    const response = await apiClient.post<{ statusCode: number; message: string; data: { barcode: string } }>(`${this.baseEndpoint}/${id}/barcode`);
    return response.data;
  }

  async updateProductBarcode(id: number, barcode: string): Promise<Product> {
    const response = await apiClient.put<ProductResponse>(`${this.baseEndpoint}/${id}/barcode`, { barcode });
    return response.data;
  }

  async getProductByBarcode(barcode: string, includeShopInventory = false): Promise<Product | null> {
    try {
      const params = includeShopInventory ? '?includeShopInventory=true' : '';
      const response = await apiClient.get<ProductResponse>(`${this.baseEndpoint}/barcode/${encodeURIComponent(barcode)}${params}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async bulkGenerateBarcodes(productIds: number[]): Promise<Array<{ id: number; barcode: string }>> {
    const response = await apiClient.post<{
      statusCode: number;
      message: string;
      data: Array<{ id: number; barcode: string }>;
    }>(`${this.baseEndpoint}/bulk/barcodes`, { productIds });
    return response.data;
  }

  // Autocomplete search for product names
  async searchAutocomplete(query: string): Promise<ProductAutocompleteResponse> {
    const params = new URLSearchParams();
    params.append('q', query);
    const response = await apiClient.get<ProductAutocompleteResponse>(
      `${this.baseEndpoint}/search/autocomplete?${params.toString()}`
    );
    return response;
  }
}

export const productService = new ProductService();