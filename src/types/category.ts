// src/types/category.ts
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentCategoryId?: number | null;
  parentCategory?: Category | null;
  status: 'active' | 'inactive';
  sortOrder: number;
  isFeatured: boolean;
  metadata?: {
    seoKeywords?: string[];
    commission?: number;
    displayColor?: string;
  };
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  hasChildren?: boolean;
  childrenCount?: number;
  children?: Category[];
}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive';
  parentCategoryId?: number | null;
  isFeatured?: boolean;
  search?: string;
  includeChildren?: boolean;
  sortBy?: 'name' | 'createdAt' | 'sortOrder' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface CategoryListResponse {
  success: boolean;
  message: string;
  data: Category[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  parentCategoryId?: number | null;
  status?: 'active' | 'inactive';
  sortOrder?: number;
  isFeatured?: boolean;
  metadata?: {
    seoKeywords?: string[];
    commission?: number;
    displayColor?: string;
  };
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: number;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category;
}