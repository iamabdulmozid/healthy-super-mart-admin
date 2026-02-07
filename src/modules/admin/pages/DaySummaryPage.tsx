// src/modules/admin/pages/DaySummaryPage.tsx
import { useState, useEffect } from 'react';
import { CashbookService } from '@/modules/admin/services/cashbookService';
import { formatCurrency } from '@/utils/currency';
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
  const [summary, setSummary] = useState<DaySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Get shopId from localStorage or default to 3
  const shopId = Number(localStorage.getItem('shopId')) || 1;

  // Fetch summary
  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await CashbookService.getDaySummary(shopId, selectedDate);
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch day summary');
      console.error('Error fetching summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedDate]);

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
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Day Summary</h1>
          <p className="mt-2 text-sm text-gray-600">
            Daily cashbook summary and closing balances
          </p>
        </div>
        
        {/* Date Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading summary</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Summary Content */}
      {summary && (
        <>
          {/* Header Info Card */}
          <div className="mb-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 rounded-lg shadow-lg">
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
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Opening Balance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Opening Cash */}
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cash Opening</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {formatCurrency(summary.openingBalanceCash)}
                    </p>
                  </div>
                  <BanknotesIcon className="w-12 h-12 text-blue-500" />
                </div>
              </div>

              {/* Opening Card */}
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Card Opening</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {formatCurrency(summary.openingBalanceCard)}
                    </p>
                  </div>
                  <CreditCardIcon className="w-12 h-12 text-purple-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Transactions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Sales Cash */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">Sales (Cash)</p>
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.totalSalesCash)}
                </p>
              </div>

              {/* Sales Card */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">Sales (Card)</p>
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.totalSalesCard)}
                </p>
              </div>

              {/* Total Sales */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-sm border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-green-700">Total Sales</p>
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(summary.totalSalesCash + summary.totalSalesCard)}
                </p>
              </div>

              {/* Returns Cash */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">Returns (Cash)</p>
                  <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.totalReturnsCash)}
                </p>
              </div>

              {/* Returns Card */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">Returns (Card)</p>
                  <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.totalReturnsCard)}
                </p>
              </div>

              {/* Total Returns */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg shadow-sm border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-red-700">Total Returns</p>
                  <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-700">
                  {formatCurrency(summary.totalReturnsCash + summary.totalReturnsCard)}
                </p>
              </div>

              {/* Withdrawals Cash */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">Withdrawals (Cash)</p>
                  <BanknotesIcon className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(summary.totalWithdrawalsCash)}
                </p>
              </div>

              {/* Withdrawals Card */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-500">Withdrawals (Card)</p>
                  <CreditCardIcon className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(summary.totalWithdrawalsCard)}
                </p>
              </div>

              {/* Total Withdrawals */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg shadow-sm border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-orange-700">Total Withdrawals</p>
                  <BanknotesIcon className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-orange-700">
                  {formatCurrency(summary.totalWithdrawalsCash + summary.totalWithdrawalsCard)}
                </p>
              </div>
            </div>
          </div>

          {/* Closing Balance Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Closing Balance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Closing Cash */}
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cash Closing</p>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">
                      {formatCurrency(summary.closingBalanceCash)}
                    </p>
                  </div>
                  <BanknotesIcon className="w-12 h-12 text-indigo-500" />
                </div>
              </div>

              {/* Closing Card */}
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-pink-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Card Closing</p>
                    <p className="text-3xl font-bold text-pink-600 mt-2">
                      {formatCurrency(summary.closingBalanceCard)}
                    </p>
                  </div>
                  <CreditCardIcon className="w-12 h-12 text-pink-500" />
                </div>
              </div>

              {/* Total Closing */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 rounded-lg shadow-lg text-white">
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
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Balance Calculation</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                <span className="text-gray-600 font-medium">Opening Balance (Cash + Card)</span>
                <span className="font-semibold text-gray-900">
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
              <div className="flex justify-between items-center pt-2 border-t-2 border-gray-400">
                <span className="text-gray-900 font-bold text-base">Closing Balance</span>
                <span className="font-bold text-primary-600 text-lg">
                  {formatCurrency(summary.closingBalanceCash + summary.closingBalanceCard)}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
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
          </div>
        </>
      )}

      {!summary && !isLoading && !error && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">No data available for the selected date</p>
        </div>
      )}
    </div>
  );
}
