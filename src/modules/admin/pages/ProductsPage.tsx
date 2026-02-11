// src/modules/admin/pages/ProductsPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { productService } from '../services/productService';
import { 
  ProductList, 
  ProductForm, 
  ProductFilters, 
  DeleteConfirmModal,
  BarcodeGenerator,
  BulkBarcodeGenerator,
  LowQuantityAlert
} from '../components';
import { Button, Badge } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import type { Product, ProductFilters as ProductFiltersType } from '@/types/product';

export default function ProductsPage() {
  const { showError, showSuccess } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [viewingBarcodeProduct, setViewingBarcodeProduct] = useState<Product | null>(null);
  const [showBulkBarcodeGenerator, setShowBulkBarcodeGenerator] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10
  });

  const [filters, setFilters] = useState<ProductFiltersType>({
    page: 1,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'ASC'
  });

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts(filters);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error: any) {
      showError(
        error.message || 'Failed to load products',
        `Error${error.code ? ` (${error.code})` : ''}`,
        error.errors
      );
    } finally {
      setLoading(false);
    }
  }, [filters, showError]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleFiltersChange = (newFilters: ProductFiltersType) => {
    setFilters({ ...newFilters, page: 1 }); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleCreateProduct = () => {
    setShowCreateModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleViewProduct = async (product: Product) => {
    try {
      // Load full product details with shop inventory
      const fullProduct = await productService.getProductById(product.id, true);
      console.log('Product details:', fullProduct);
      showSuccess('Product details loaded successfully');
      // You can implement a view modal here if needed
    } catch (error: any) {
      showError(
        error.message || 'Failed to load product details',
        `Error${error.code ? ` (${error.code})` : ''}`,
        error.errors
      );
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
  };

  const handleFormSubmit = async () => {
    setShowCreateModal(false);
    setEditingProduct(null);
    await loadProducts();
    showSuccess(
      editingProduct ? 'Product updated successfully' : 'Product created successfully',
      'Success'
    );
  };

  const handleFormClose = () => {
    setShowCreateModal(false);
    setEditingProduct(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;

    try {
      await productService.deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
      await loadProducts();
      showSuccess('Product deleted successfully', 'Success');
    } catch (error: any) {
      showError(
        error.message || 'Failed to delete product',
        `Error${error.code ? ` (${error.code})` : ''}`,
        error.errors
      );
    }
  };

  const handleCancelDelete = () => {
    setDeletingProduct(null);
  };

  const handleGenerateBarcode = (product: Product) => {
    setViewingBarcodeProduct(product);
  };

  const handleCloseBarcodeModal = () => {
    setViewingBarcodeProduct(null);
  };

  // const handleBulkBarcodeGeneration = () => {
  //   setShowBulkBarcodeGenerator(true);
  // };

  const handleCloseBulkBarcodeGenerator = () => {
    setShowBulkBarcodeGenerator(false);
  };

  const handleFilterLowQuantity = () => {
    setFilters(prev => ({ 
      ...prev, 
      lowQuantity: true, 
      page: 1 
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center">
            {filters.lowQuantity ? (
              <Badge variant="warning">
                {pagination.total} low stock {pagination.total === 1 ? 'item' : 'items'}
              </Badge>
            ) : (
              <p className="text-neutral-600">
                {pagination.total} total {pagination.total === 1 ? 'product' : 'products'}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={handleCreateProduct}
            icon={<PlusIcon className="h-5 w-5" />}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Low Quantity Alert - Only show when not filtering by low quantity */}
      {!showCreateModal && !editingProduct && !filters.lowQuantity && (
        <LowQuantityAlert 
          products={products}
          onFilterLowQuantity={handleFilterLowQuantity}
        />
      )}

      {/* Create/Edit Form - Show above the list when active */}
      {(showCreateModal || editingProduct) && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Show filters and list only when not creating/editing */}
      {!showCreateModal && !editingProduct && (
        <>
          {/* Filters */}
          <ProductFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />

          {/* Products List */}
          <ProductList
            products={products}
            loading={loading}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onView={handleViewProduct}
            onGenerateBarcode={handleGenerateBarcode}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <DeleteConfirmModal
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete Product"
          message={`Are you sure you want to delete "${deletingProduct.name}"? This action cannot be undone.`}
        />
      )}

      {/* Individual Barcode Generator Modal */}
      {viewingBarcodeProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Product Barcode
              </h3>
              <button
                onClick={handleCloseBarcodeModal}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-100"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <BarcodeGenerator 
              product={viewingBarcodeProduct}
              showControls={true}
            />
          </div>
        </div>
      )}

      {/* Bulk Barcode Generator Modal */}
      <BulkBarcodeGenerator
        products={products.filter(p => p.status === 'active')}
        isOpen={showBulkBarcodeGenerator}
        onClose={handleCloseBulkBarcodeGenerator}
      />
    </div>
  );
}