import { useState, useEffect } from 'react';
import { OrderService } from '../services/orderService';
import { formatCurrency } from '@/utils/currency';
import { Card, CardContent } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import type { OrderSummary, SummaryPreset } from '@/types/order';
import {
  ShoppingBagIcon,
  BanknotesIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';

export default function AdminKPIs() {
  const { showError } = useToast();
  const [summary, setSummary] = useState<OrderSummary>({
    total_orders: 0,
    total_sales: 0,
    total_items_sold: 0,
  });
  const [selectedPreset, setSelectedPreset] = useState<SummaryPreset>('today');
  const [loading, setLoading] = useState(true);

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
      const data = await OrderService.getOrdersSummary(preset);
      setSummary(data);
    } catch (err: any) {
      showError(
        err?.message || 'Failed to fetch orders summary',
        `Error${err?.code ? ` (${err.code})` : ''}`,
        err?.errors
      );
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

  const kpiCards = [
    {
      title: 'Total Orders',
      value: summary.total_orders.toLocaleString(),
      icon: ShoppingBagIcon,
      bgColor: 'bg-primary-100',
      iconColor: 'text-primary-600',
    },
    {
      title: 'Total Sales',
      value: formatCurrency(summary.total_sales),
      icon: BanknotesIcon,
      bgColor: 'bg-secondary-100',
      iconColor: 'text-secondary-600',
    },
    {
      title: 'Items Sold',
      value: summary.total_items_sold.toLocaleString(),
      icon: CubeIcon,
      bgColor: 'bg-accent-100',
      iconColor: 'text-accent-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Time Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold text-neutral-900">Key Performance Indicators</h3>
        <div className="flex items-center gap-2">
          <label htmlFor="preset-select" className="text-sm font-medium text-neutral-700 uppercase tracking-wide">
            Period:
          </label>
          <select
            id="preset-select"
            value={selectedPreset}
            onChange={handlePresetChange}
            className="border border-neutral-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white transition-all"
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} variant="bordered" padding="none" className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                      {kpi.title}
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-neutral-900">
                      {loading ? (
                        <span className="inline-block w-20 h-8 bg-neutral-100 rounded animate-pulse" />
                      ) : (
                        kpi.value
                      )}
                    </p>
                  </div>
                  <div className={`${kpi.bgColor} p-3 rounded-xl`}>
                    <Icon className={`w-6 h-6 ${kpi.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
