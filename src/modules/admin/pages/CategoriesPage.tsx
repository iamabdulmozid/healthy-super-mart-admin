// src/modules/admin/pages/CategoriesPage.tsx
import { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { categoryService } from '../services/categoryService';
import type { Category, CategoryFilters } from '@/types/category';
import { CategoryList, CategoryForm, DeleteConfirmModal } from '../components';
import { Button, Card } from '@/components/ui';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [parentFilter, setParentFilter] = useState<'all' | 'parent' | 'subcategory'>('all');
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10
  });

  const loadCategories = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: CategoryFilters = {
        page,
        limit: pagination.limit,
        includeChildren: false,
        sortBy: 'name',
        sortOrder: 'ASC'
      };

      if (searchTerm) {
        filters.search = searchTerm;
      }

      if (statusFilter !== 'all') {
        filters.status = statusFilter as 'active' | 'inactive';
      }

      if (parentFilter === 'parent') {
        filters.parentCategoryId = null;
      } else if (parentFilter === 'subcategory') {
        // For subcategories, we'll need to exclude null parent categories
        // This will be handled in the filter logic
      }

      const response = await categoryService.getAllCategories(filters);
      setCategories(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [searchTerm, statusFilter, parentFilter]);

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setDeletingCategory(category);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingCategory(null);
    loadCategories(pagination.currentPage);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    try {
      await categoryService.deleteCategory(deletingCategory.id);
      setDeletingCategory(null);
      loadCategories(pagination.currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      setDeletingCategory(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingCategory(null);
  };

  const handlePageChange = (page: number) => {
    loadCategories(page);
  };

  const filteredCategories = categories.filter(category => {
    if (parentFilter === 'parent') {
      return category.parentCategoryId === null;
    } else if (parentFilter === 'subcategory') {
      return category.parentCategoryId !== null;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-neutral-600">Manage your product categories and subcategories</p>
        </div>
        <Button
          variant="primary"
          onClick={handleCreateCategory}
          icon={<PlusIcon className="h-5 w-5" />}
        >
          Add Category
        </Button>
      </div>

      {/* Filters - Show only when not creating/editing */}
      {!showForm && (
        <Card padding="md">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-neutral-900 placeholder:text-neutral-400"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-neutral-900 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={parentFilter}
              onChange={(e) => setParentFilter(e.target.value as 'all' | 'parent' | 'subcategory')}
              className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-neutral-900 text-sm"
            >
              <option value="all">All Categories</option>
              <option value="parent">Parent Categories</option>
              <option value="subcategory">Subcategories</option>
            </select>
          </div>
        </Card>
      )}

      {/* Create/Edit Form - Show above the list when active */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Show error and list only when not creating/editing */}
      {!showForm && (
        <>
          {error && (
            <Card variant="bordered" padding="md" className="bg-red-50 border-red-200">
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </Card>
          )}

          <CategoryList
            categories={filteredCategories}
            loading={loading}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {deletingCategory && (
        <DeleteConfirmModal
          title="Delete Category"
          message={`Are you sure you want to delete "${deletingCategory.name}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}