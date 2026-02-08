// src/utils/dashboard.ts
import type { OrderSummary } from '@/types/order';
import { formatCurrency as formatCurrencyUtil } from './currency';

/**
 * Utility functions for dashboard data processing
 */

export const formatOrderSummaryData = (data: OrderSummary) => {
  return {
    orders: data.total_orders,
    sales: data.total_sales,
    itemsSold: data.total_items_sold,
  };
};

export const formatCurrency = (amount: number, _currency: string = 'BDT') => {
  // Use centralized currency formatter
  // The currency parameter is kept for backward compatibility but not used
  return formatCurrencyUtil(amount);
};

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const getPresetLabel = (preset: string): string => {
  const labels: Record<string, string> = {
    today: 'Today',
    yesterday: 'Yesterday',
    this_week: 'This Week',
    last_30_days: 'Last 30 Days',
    all_time: 'All Time',
  };
  return labels[preset] || preset;
};

export const calculateGrowthPercentage = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};
