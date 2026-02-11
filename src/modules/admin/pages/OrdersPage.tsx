// src/modules/admin/pages/OrdersPage.tsx
import { useState, useEffect, useMemo } from 'react';
import { OrderService } from '../services/orderService';
import OrderTable from '../components/OrderTable';
import OrderFilters from '../components/OrderFilters';
import { Card, CardContent } from '@/components/ui';
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
          <p className="text-neutral-600">Manage and track all orders from your POS and online store</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-neutral-600">Manage and track all orders from your POS and online store</p>
        </div>
        <Card variant="bordered" padding="md" className="bg-red-50 border-red-200">
          <div className="text-red-900">{error}</div>
          <button 
            onClick={() => fetchData(currentPage)}
            className="mt-2 text-red-700 hover:text-red-900 font-medium underline"
          >
            Try Again
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-neutral-600">Manage and track all orders from your POS and online store</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="md">
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">{stats?.totalOrders || 0}</div>
            <div className="text-sm text-neutral-600 mt-1">Total Orders</div>
          </CardContent>
        </Card>
        <Card padding="md">
          <CardContent>
            <div className="text-2xl font-bold text-primary-600">{stats?.todayOrders || 0}</div>
            <div className="text-sm text-neutral-600 mt-1">Today's Orders</div>
          </CardContent>
        </Card>
        <Card padding="md">
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.pendingOrders || 0}</div>
            <div className="text-sm text-neutral-600 mt-1">Pending</div>
          </CardContent>
        </Card>
        <Card padding="md">
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.completedOrders || 0}</div>
            <div className="text-sm text-neutral-600 mt-1">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <OrderFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-neutral-600">
          Showing {filteredOrders.length} of {ordersData?.total || 0} orders
        </p>
        <p className="text-sm text-neutral-600">
          Page {currentPage} of {ordersData?.totalPages || 1}
        </p>
      </div>

      {/* Orders Table */}
      <Card padding="none">
        <OrderTable 
          orders={filteredOrders}
          onOrderUpdate={handleOrderUpdate}
        />
      </Card>

      {/* Pagination */}
      {ordersData && ordersData.totalPages > 1 && (
        <div className="flex justify-center">
          <nav className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!ordersData.hasPreviousPage}
              className="px-3 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: ordersData.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  page === currentPage
                    ? 'text-primary-700 bg-primary-50 border border-primary-200 font-semibold'
                    : 'text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!ordersData.hasNextPage}
              className="px-3 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}