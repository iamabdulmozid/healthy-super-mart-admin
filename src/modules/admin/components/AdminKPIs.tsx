import { useState, useEffect } from 'react';
import { OrderService } from '../services/orderService';
import { formatCurrency } from '@/utils/currency';
import type { OrderSummary, SummaryPreset } from '@/types/order';

export default function AdminKPIs() {
  const [summary, setSummary] = useState<OrderSummary>({
    total_orders: 0,
    total_sales: 0,
    total_items_sold: 0,
  });
  const [selectedPreset, setSelectedPreset] = useState<SummaryPreset>('today');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const presetOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'all_time', label: 'All Time' },
  ];

  const fetchSummary = async (preset: SummaryPreset) => {
    try {
      setLoading(true);
      setError(null);
      const data = await OrderService.getOrdersSummary(preset);
      setSummary(data);
    } catch (err) {
      setError('Failed to fetch orders summary');
      console.error('Error fetching orders summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(selectedPreset);
  }, [selectedPreset]);

  const handlePresetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPreset = event.target.value as SummaryPreset;
    setSelectedPreset(newPreset);
  };

  return (
    <div className="space-y-4">
      {/* Time Period Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Key Performance Indicators</h3>
        <div className="flex items-center space-x-2">
          <label htmlFor="preset-select" className="text-sm font-medium text-gray-700">
            Time Period:
          </label>
          <select
            id="preset-select"
            value={selectedPreset}
            onChange={handlePresetChange}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            {presetOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Total Orders
              </h4>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {loading ? '...' : summary.total_orders.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Total Sales
              </h4>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {loading ? '...' : formatCurrency(summary.total_sales)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Items Sold
              </h4>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {loading ? '...' : summary.total_items_sold.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}