// src/modules/admin/components/OrderFilters.tsx
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { OrderFilters } from '@/types/order';

interface OrderFiltersProps {
  filters: OrderFilters;
  onFiltersChange: (filters: OrderFilters) => void;
}

export default function OrderFilters({ filters, onFiltersChange }: OrderFiltersProps) {
  const handleFilterChange = (key: keyof OrderFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="md:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Orders
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              placeholder="Search by order ID, shop name, or product..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-neutral-200 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Order Source Filter */}
        <div>
          <label htmlFor="orderSource" className="block text-sm font-medium text-gray-700 mb-2">
            Order Source
          </label>
          <select
            id="orderSource"
            value={filters.orderSource}
            onChange={(e) => handleFilterChange('orderSource', e.target.value)}
            className="block w-full px-3 py-2 border border-neutral-200 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Sources</option>
            <option value="pos">POS</option>
            <option value="online">Online</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Order Status
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="block w-full px-3 py-2 border border-neutral-200 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.search || filters.orderSource || filters.status) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700">Active filters:</span>
          
          {filters.search && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{filters.search}"
              <button
                onClick={() => handleFilterChange('search', '')}
                className="ml-1.5 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          
          {filters.orderSource && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Source: {filters.orderSource.toUpperCase()}
              <button
                onClick={() => handleFilterChange('orderSource', '')}
                className="ml-1.5 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
          
          {filters.status && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Status: {filters.status}
              <button
                onClick={() => handleFilterChange('status', '')}
                className="ml-1.5 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}

          <button
            onClick={() => onFiltersChange({ search: '', orderSource: '', status: '' })}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}