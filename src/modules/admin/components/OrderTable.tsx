// src/modules/admin/components/OrderTable.tsx
import { useState } from 'react';
import { formatCurrency } from '@/utils/currency';
import type { Order } from '@/types/order';
import { OrderService } from '../services/orderService';
import ReceiptGenerator from '../../pos/components/ReceiptGenerator';

interface OrderTableProps {
  orders: Order[];
  onOrderUpdate: (updatedOrder: Order) => void;
}

export default function OrderTable({ orders, onOrderUpdate }: OrderTableProps) {
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const handleStatusUpdate = async (orderId: number, newStatus: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled') => {
    try {
      setUpdatingOrderId(orderId);
      const updatedOrder = await OrderService.updateOrderStatus({
        id: orderId,
        status: newStatus
      });
      onOrderUpdate(updatedOrder);
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceBadgeColor = (source: string) => {
    return source === 'pos' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800';
  };

  const getRowBackgroundClass = (status: string) => {
    if (status.toLowerCase() === 'canceled') {
      return 'bg-red-50 hover:bg-red-100';
    }
    return 'hover:bg-gray-50';
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No orders found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto max-w-full">
      <table className="w-full bg-white border border-neutral-200 table-fixed overflow-hidden rounded-lg">
        <colgroup>
          <col className="w-20" />
          <col className="w-28" />
          <col className="w-32" />
          <col className="w-24" />
          <col className="w-24" />
          <col className="w-28" />
          <col className="w-20" />
          <col className="w-32" />
        </colgroup>
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
              Order ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Shop
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Items
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className={getRowBackgroundClass(order.status)}>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                #{order.id}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                <div className="text-xs">
                  <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                  <div className="text-gray-400">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                <div>
                  <div className="font-medium text-xs">{order.shop.name}</div>
                  <div className="text-gray-500 text-xs">{order.locationCode}</div>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                <div>
                  <div className="text-xs">{order.orderItems.length} item(s)</div>
                  <div className="text-xs text-gray-400 truncate max-w-24">
                    {order.orderItems.slice(0, 1).map(item => item.product.name).join(', ')}
                    {order.orderItems.length > 1 && '...'}
                  </div>
                </div>
              </td>
              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                <div>
                  <div className="font-medium text-xs">{formatCurrency(order.total)}</div>
                  <div className="text-xs text-gray-500">
                    +{formatCurrency(order.shippingCost)} ship
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="space-y-1">
                  <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getSourceBadgeColor(order.orderSource)}`}>
                    {order.orderSource.toUpperCase()}
                  </span>
                  <div>
                    <span className={`inline-flex items-center px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                      order.paymentMethod === 'cash' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.paymentMethod === 'cash' ? '💵' : '💳'}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value as 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled')}
                    disabled={updatingOrderId === order.id}
                    className="text-xs border border-neutral-200 rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <ReceiptGenerator order={order} compact />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}