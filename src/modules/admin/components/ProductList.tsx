// src/modules/admin/components/ProductList.tsx
import { PencilIcon, TrashIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/currency';
import { Badge, Button } from '@/components/ui';
import type { Product } from '@/types/product';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onView: (product: Product) => void;
  onGenerateBarcode?: (product: Product) => void;
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  onPageChange: (page: number) => void;
}

export default function ProductList({ 
  products, 
  loading, 
  onEdit, 
  onDelete, 
  onView,
  onGenerateBarcode,
  pagination, 
  onPageChange 
}: ProductListProps) {
  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="success" size="sm">Active</Badge>
    ) : (
      <Badge variant="danger" size="sm">Inactive</Badge>
    );
  };

  const getFeaturedBadge = (isFeatured: boolean) => {
    return isFeatured ? (
      <Badge variant="warning" size="sm">Featured</Badge>
    ) : null;
  };

  const formatPrice = (price: string | number | undefined | null) => {
    if (price === undefined || price === null || price === '') {
      return formatCurrency(0, { showDecimals: true });
    }
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return formatCurrency(numPrice, { showDecimals: true });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-(--color-border) shadow-xs">
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-3 border-primary-600"></div>
          <p className="mt-4 text-neutral-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-(--color-border) shadow-xs">
        <div className="p-12 text-center">
          <div className="mx-auto h-16 w-16 text-neutral-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-neutral-900">No products found</h3>
          <p className="mt-2 text-neutral-600">Get started by creating your first product.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-(--color-border) shadow-xs overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="min-w-full divide-y divide-(--color-border-light)">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Prices
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Barcode
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-(--color-border-light)">
            {products.map((product) => (
              <tr key={product.id} className={`hover:bg-neutral-50 transition-colors ${product.stockQuantity < 10 ? 'bg-red-50/50 border-l-4 border-red-500' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      {product.image ? (
                        <img className="h-10 w-10 rounded-lg object-cover" src={product.image} alt={product.name} />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-neutral-900">{product.name}</div>
                      <div className="text-xs text-neutral-500 font-mono">{product.slug}</div>
                      <div className="flex space-x-2 mt-1.5">
                        {getFeaturedBadge(product.isFeatured)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm space-y-0.5">
                    <div className="text-neutral-700 font-medium">Retail: {formatPrice(product.retailPrice)}</div>
                    <div className="text-primary-600 font-medium">
                      POS: {product.posPrice !== undefined && product.posPrice !== null 
                        ? formatPrice(product.posPrice) 
                        : <span className="text-neutral-400 italic">Not set</span>
                      }
                    </div>
                    <div className="text-neutral-500">Wholesale: {formatPrice(product.wholesalePrice)}</div>
                    {product.oldPrice && (
                      <div className="text-neutral-400 line-through text-xs">Old: {formatPrice(product.oldPrice)}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold text-lg ${product.stockQuantity < 10 ? 'text-red-600' : 'text-neutral-900'}`}>
                        {product.stockQuantity}
                      </span>
                      {product.stockQuantity < 10 && (
                        <Badge variant="danger" size="sm" className="flex items-center gap-1">
                          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Low
                        </Badge>
                      )}
                    </div>
                    {product.weight && (
                      <div className="text-xs text-neutral-500 mt-1">{product.weight}kg</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1.5">
                    {getStatusBadge(product.status)}
                    <span className="text-xs text-neutral-500 capitalize font-medium">{product.shippingType}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {product.barcode ? (
                    <div className="flex items-center space-x-2">
                      <code className="bg-neutral-100 px-2.5 py-1 rounded-md text-xs font-mono text-neutral-700">
                        {product.barcode}
                      </code>
                      {onGenerateBarcode && (
                        <button
                          onClick={() => onGenerateBarcode(product)}
                          className="text-primary-600 hover:text-primary-800 p-1 hover:bg-primary-50 rounded transition-colors"
                          title="View/Print Barcode"
                        >
                          <QrCodeIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-neutral-400 text-xs italic">No barcode</span>
                      {onGenerateBarcode && (
                        <button
                          onClick={() => onGenerateBarcode(product)}
                          className="text-neutral-500 hover:text-neutral-700 p-1 hover:bg-neutral-50 rounded transition-colors"
                          title="Generate Barcode"
                        >
                          <QrCodeIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 font-medium">
                  {new Date(product.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => onView(product)}
                      className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors"
                      title="View product"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 text-accent-600 hover:text-accent-800 hover:bg-accent-50 rounded-lg transition-colors"
                      title="Edit product"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(product)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete product"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-neutral-50 px-4 py-4 flex items-center justify-between border-t border-(--color-border-light)">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-neutral-700">
                Showing{' '}
                <span className="font-semibold text-neutral-900">
                  {(pagination.currentPage - 1) * pagination.limit + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-neutral-900">
                  {Math.min(pagination.currentPage * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-semibold text-neutral-900">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-lg border border-(--color-border) bg-white shadow-xs overflow-hidden">
                <button
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-r border-(--color-border-light)"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border-r border-(--color-border-light) text-sm font-medium transition-colors ${
                        pagination.currentPage === page
                          ? 'bg-primary-600 text-white z-10'
                          : 'bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}