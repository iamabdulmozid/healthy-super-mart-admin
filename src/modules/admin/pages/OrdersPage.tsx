// src/modules/admin/pages/OrdersPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { OrderService } from '../services/orderService';
import OrderTable from '../components/OrderTable';
import OrderFilters from '../components/OrderFilters';
import type { Order, OrderFilters as OrderFiltersType, OrderStats, OrdersResponse } from '@/types/order';

export default function OrdersPage() {
  const [ordersData, setOrdersData] = useState<OrdersResponse | null>(null);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<OrderFiltersType>({
    search: '',
    orderSource: '',
    status: ''
  });

  const limit = 10;

  // Fetch orders and stats
  const fetchData = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const [ordersResponse, statsResponse] = await Promise.all([
        OrderService.getOrders(page, limit),
        OrderService.getOrderStats()
      ]);
      
      setOrdersData(ordersResponse);
      setStats(statsResponse);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and page change
  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  // Filter orders based on current filters
  const filteredOrders = useMemo(() => {
    if (!ordersData?.orders) return [];
    
    return ordersData.orders.filter(order => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesId = order.id.toString().includes(searchLower);
        const matchesShop = order.shop.name.toLowerCase().includes(searchLower);
        const matchesProducts = order.orderItems.some(item => 
          item.product.name.toLowerCase().includes(searchLower)
        );
        
        if (!matchesId && !matchesShop && !matchesProducts) {
          return false;
        }
      }

      // Order source filter
      if (filters.orderSource && order.orderSource !== filters.orderSource) {
        return false;
      }

      // Status filter
      if (filters.status && order.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [ordersData?.orders, filters]);

  // Handle order update from table
  const handleOrderUpdate = (updatedOrder: Order) => {
    if (!ordersData) return;
    
    setOrdersData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        orders: prev.orders.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        )
      };
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage and track all orders from your POS and online store</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage and track all orders from your POS and online store</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
          <button 
            onClick={() => fetchData(currentPage)}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600">Manage and track all orders from your POS and online store</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{stats?.todayOrders || 0}</div>
          <div className="text-sm text-gray-600">Today's Orders</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">{stats?.pendingOrders || 0}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{stats?.completedOrders || 0}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Filters */}
      <OrderFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {filteredOrders.length} of {ordersData?.total || 0} orders
        </p>
        <p className="text-sm text-gray-600">
          Page {currentPage} of {ordersData?.totalPages || 1}
        </p>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <OrderTable 
          orders={filteredOrders}
          onOrderUpdate={handleOrderUpdate}
        />
      </div>

      {/* Pagination */}
      {ordersData && ordersData.totalPages > 1 && (
        <div className="flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!ordersData.hasPreviousPage}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: ordersData.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  page === currentPage
                    ? 'text-blue-600 bg-blue-50 border border-blue-300'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!ordersData.hasNextPage}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}