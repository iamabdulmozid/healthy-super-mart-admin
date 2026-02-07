// src/types/product.ts
export interface ProductTag {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  isActive: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductTagListResponse {
  tags: ProductTag[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  categoryId: number;
  category?: any; // Will be populated when included in response
  subcategoryId?: number;
  subcategory?: any; // Will be populated when included in response
  shopId: number;
  purchasePrice: string | number;
  retailPrice: string | number;
  posPrice: string | number;
  wholesalePrice: string | number;
  oldPrice?: string | number;
  weight: string | number;
  stockQuantity: number;
  image?: string;
  shippingType: 'dry' | 'chilled';
  status: 'active' | 'inactive';
  isFeatured: boolean;
  sortOrder: number;
  sku?: string;
  barcode?: string;
  supplier: string;
  minOrderQuantity: number;
  maxOrderQuantity?: number;
  metadata?: any;
  tags?: ProductTag[]; // Tags associated with the product
  locationStocks?: any[]; // For shop inventory data
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  totalStockQuantity?: number;
  discountPercentage?: number;
  isOnSale?: boolean;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  status?: 'active' | 'inactive';
  lowQuantity?: boolean; // Filter for products with quantity < 10
  sortBy?: 'name' | 'createdAt' | 'retailPrice' | 'posPrice' | 'stockQuantity' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
  includeShopInventory?: boolean;
}

export interface ProductListResponse {
  statusCode: number;
  message: string;
  data: {
    products: Product[];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

export interface ProductResponse {
  statusCode: number;
  message: string;
  data: Product;
}

export interface CreateProductRequest {
  name: string;
  slug?: string;
  description?: string;
  categoryId: number;
  subcategoryId?: number;
  shopId?: number; // For single shop (update endpoint)
  shopIds?: number[]; // For multi-shop (create endpoint)
  purchasePrice: number;
  retailPrice: number;
  posPrice: number
  wholesalePrice: number;
  oldPrice?: number;
  weight: number;
  stockQuantity: number;
  image?: string;
  shippingType: 'dry' | 'chilled';
  status?: 'active' | 'inactive';
  isFeatured?: boolean;
  sku?: string;
  barcode?: string;
  supplier: string;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  metadata?: any;
  tagIds?: number[]; // Array of tag IDs to associate with the product
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id?: number;
}

export interface DeleteProductResponse {
  statusCode: number;
  message: string;
}

export interface ProductAutocompleteItem {
  id: number;
  name: string;
  barcode: string;
}

export interface ProductAutocompleteResponse {
  statusCode: number;
  message: string;
  data: ProductAutocompleteItem[];
}