// src/modules/admin/pages/DaySummaryPage.tsx
import { useState, useEffect } from 'react';
import { CashbookService } from '@/modules/admin/services/cashbookService';
import { formatCurrency } from '@/utils/currency';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui';
import type { DaySummary } from '@/types/transaction';
import { 
  BanknotesIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  CreditCardIcon,
  ScaleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function DaySummaryPage() {
  const { showError } = useToast();
  const [summary, setSummary] = useState<DaySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Get shopId from localStorage or default to 3
  const shopId = Number(localStorage.getItem('shopId')) || 1;

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      try {
        setIsLoading(true);
        
        const data = await CashbookService.getDaySummary(shopId, selectedDate);
        
        if (isMounted) {
          setSummary(data);
        }
      } catch (err: any) {
        if (isMounted) {
          const hasErrors = err.errors && err.errors.length > 0;
          const errorMessage = hasErrors 
            ? 'Failed to load day summary. Please try again.'
            : (err.message || 'Failed to fetch day summary');
          
          showError(
            errorMessage,
            `Error${err.code ? ` (${err.code})` : ''}`,
            hasErrors ? err.errors : undefined
          );
          console.error('Error fetching summary:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, [selectedDate, shopId, showError]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-100 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-40 bg-neutral-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-neutral-600">
            Daily cashbook summary and closing balances
          </p>
        </div>
        
        {/* Date Picker */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-neutral-900"
          />
        </div>
      </div>

      {/* Summary Content */}
      {summary && (
        <>
          {/* Header Info Card */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Summary for</p>
                <p className="text-2xl font-bold mt-1">{formatDate(summary.summaryDate)}</p>
                <div className="mt-3 flex items-center gap-2">
                  {summary.isFinalized ? (
                    <span className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm">
                      <CheckCircleIcon className="w-4 h-4" />
                      Finalized
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-yellow-500/30 px-3 py-1 rounded-full text-sm">
                      <ClockIcon className="w-4 h-4" />
                      In Progress
                    </span>
                  )}
                </div>
              </div>
              <ScaleIcon className="w-16 h-16 opacity-50" />
            </div>
          </div>

          {/* Opening Balance Section */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Opening Balance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Opening Cash */}
              <Card padding="lg" className="border-l-4 border-primary-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Cash Opening</p>
                    <p className="text-3xl font-bold text-primary-600 mt-2">
                      {formatCurrency(summary.openingBalanceCash)}
                    </p>
                  </div>
                  <BanknotesIcon className="w-12 h-12 text-primary-500" />
                </div>
              </Card>

              {/* Opening Card */}
              <Card padding="lg" className="border-l-4 border-secondary-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Card Opening</p>
                    <p className="text-3xl font-bold text-secondary-600 mt-2">
                      {formatCurrency(summary.openingBalanceCard)}
                    </p>
                  </div>
                  <CreditCardIcon className="w-12 h-12 text-secondary-500" />
                </div>
              </Card>
            </div>
          </div>

          {/* Transactions Section */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Daily Transactions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Sales Cash */}
              <Card padding="lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-neutral-500">Sales (Cash)</p>
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.totalSalesCash)}
                </p>
              </Card>

              {/* Sales Card */}
              <Card padding="lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-neutral-500">Sales (Card)</p>
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.totalSalesCard)}
                </p>
              </Card>

              {/* Total Sales */}
              <Card padding="lg" variant="bordered" className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-green-700">Total Sales</p>
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(summary.totalSalesCash + summary.totalSalesCard)}
                </p>
              </Card>

              {/* Returns Cash */}
              <Card padding="lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-neutral-500">Returns (Cash)</p>
                  <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.totalReturnsCash)}
                </p>
              </Card>

              {/* Returns Card */}
              <Card padding="lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-neutral-500">Returns (Card)</p>
                  <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.totalReturnsCard)}
                </p>
              </Card>

              {/* Total Returns */}
              <Card padding="lg" variant="bordered" className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-red-700">Total Returns</p>
                  <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-700">
                  {formatCurrency(summary.totalReturnsCash + summary.totalReturnsCard)}
                </p>
              </Card>

              {/* Withdrawals Cash */}
              <Card padding="lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-neutral-500">Withdrawals (Cash)</p>
                  <BanknotesIcon className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(summary.totalWithdrawalsCash)}
                </p>
              </Card>

              {/* Withdrawals Card */}
              <Card padding="lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-neutral-500">Withdrawals (Card)</p>
                  <CreditCardIcon className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(summary.totalWithdrawalsCard)}
                </p>
              </Card>

              {/* Total Withdrawals */}
              <Card padding="lg" variant="bordered" className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-orange-700">Total Withdrawals</p>
                  <BanknotesIcon className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-orange-700">
                  {formatCurrency(summary.totalWithdrawalsCash + summary.totalWithdrawalsCard)}
                </p>
              </Card>
            </div>
          </div>

          {/* Closing Balance Section */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Closing Balance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Closing Cash */}
              <Card padding="lg" className="border-l-4 border-accent-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Cash Closing</p>
                    <p className="text-3xl font-bold text-accent-600 mt-2">
                      {formatCurrency(summary.closingBalanceCash)}
                    </p>
                  </div>
                  <BanknotesIcon className="w-12 h-12 text-accent-500" />
                </div>
              </Card>

              {/* Closing Card */}
              <Card padding="lg" className="border-l-4 border-secondary-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Card Closing</p>
                    <p className="text-3xl font-bold text-secondary-600 mt-2">
                      {formatCurrency(summary.closingBalanceCard)}
                    </p>
                  </div>
                  <CreditCardIcon className="w-12 h-12 text-secondary-500" />
                </div>
              </Card>

              {/* Total Closing */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 rounded-lg shadow-sm text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Closing</p>
                    <p className="text-3xl font-bold mt-2">
                      {formatCurrency(summary.closingBalanceCash + summary.closingBalanceCard)}
                    </p>
                  </div>
                  <ScaleIcon className="w-12 h-12 opacity-75" />
                </div>
              </div>
            </div>
          </div>

          {/* Summary Calculation Breakdown */}
          <Card variant="bordered" padding="lg" className="bg-neutral-50 border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Balance Calculation</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-300">
                <span className="text-neutral-600 font-medium">Opening Balance (Cash + Card)</span>
                <span className="font-semibold text-neutral-900">
                  {formatCurrency(summary.openingBalanceCash + summary.openingBalanceCard)}
                </span>
              </div>
              <div className="flex justify-between items-center text-green-600">
                <span className="font-medium">+ Total Sales</span>
                <span className="font-semibold">
                  {formatCurrency(summary.totalSalesCash + summary.totalSalesCard)}
                </span>
              </div>
              <div className="flex justify-between items-center text-red-600">
                <span className="font-medium">- Total Returns</span>
                <span className="font-semibold">
                  {formatCurrency(summary.totalReturnsCash + summary.totalReturnsCard)}
                </span>
              </div>
              <div className="flex justify-between items-center text-orange-600">
                <span className="font-medium">- Total Withdrawals</span>
                <span className="font-semibold">
                  {formatCurrency(summary.totalWithdrawalsCash + summary.totalWithdrawalsCard)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t-2 border-neutral-400">
                <span className="text-neutral-900 font-bold text-base">Closing Balance</span>
                <span className="font-bold text-primary-600 text-lg">
                  {formatCurrency(summary.closingBalanceCash + summary.closingBalanceCard)}
                </span>
              </div>
            </div>
          </Card>

          {/* Metadata */}
          <Card padding="md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-neutral-600">
              <div>
                <span className="font-medium">Summary ID:</span> #{summary.id}
              </div>
              <div>
                <span className="font-medium">Created:</span>{' '}
                {new Date(summary.createdAt).toLocaleString('en-US')}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{' '}
                {new Date(summary.updatedAt).toLocaleString('en-US')}
              </div>
            </div>
          </Card>
        </>
      )}

      {!summary && !isLoading && (
        <Card padding="lg" className="text-center">
          <p className="text-neutral-500">No data available for the selected date</p>
        </Card>
      )}
    </div>
  );
}
