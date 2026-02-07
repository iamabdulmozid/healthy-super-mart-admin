// src/modules/admin/pages/WithdrawPage.tsx
import { useState, useEffect } from 'react';
import { CashbookService } from '@/modules/admin/services/cashbookService';
import { formatCurrency, getCurrencySymbol } from '@/utils/currency';
import type { CreateWithdrawRequest, Transaction } from '@/types/transaction';
import { BanknotesIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function WithdrawPage() {
  const [formData, setFormData] = useState<CreateWithdrawRequest>({
    amount: 0,
    paymentMethod: 'cash',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [recentWithdrawals, setRecentWithdrawals] = useState<Transaction[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  // Get shopId from localStorage or default to 3
  const shopId = Number(localStorage.getItem('shopId')) || 3;

  // Calculate today's total withdrawals
  const todayTotal = recentWithdrawals
    .filter(w => {
      const withdrawalDate = new Date(w.transactionDate).toDateString();
      const today = new Date().toDateString();
      return withdrawalDate === today;
    })
    .reduce((sum, w) => sum + Math.abs(w.amount), 0);

  // Fetch recent withdrawals
  const fetchRecentWithdrawals = async () => {
    try {
      setLoadingRecent(true);
      const response = await CashbookService.getTransactions(shopId, 1, 5, {
        type: 'withdraw',
      });
      setRecentWithdrawals(response.transactions);
    } catch (err) {
      console.error('Error fetching recent withdrawals:', err);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    fetchRecentWithdrawals();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (!formData.notes.trim()) {
      setError('Please provide a note for this withdrawal');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      await CashbookService.createWithdrawal(shopId, formData);
      
      setSuccess('Withdrawal created successfully!');
      
      // Reset form
      setFormData({
        amount: 0,
        paymentMethod: 'cash',
        notes: '',
      });

      // Refresh recent withdrawals
      fetchRecentWithdrawals();
    } catch (err: any) {
      setError(err.message || 'Failed to create withdrawal');
      console.error('Error creating withdrawal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Withdraw Cash</h1>
        <p className="mt-2 text-sm text-gray-600">
          Record a cash withdrawal from the register
        </p>
      </div>

      {/* Today's Withdrawals Summary */}
      <div className="mb-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Today's Total Withdrawals</p>
            <p className="text-3xl font-bold mt-2">{formatCurrency(todayTotal)}</p>
            <p className="text-sm mt-1 opacity-75">
              {recentWithdrawals.filter(w => {
                const withdrawalDate = new Date(w.transactionDate).toDateString();
                const today = new Date().toDateString();
                return withdrawalDate === today;
              }).length} withdrawal(s) today
            </p>
          </div>
          <BanknotesIcon className="w-16 h-16 opacity-50" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Withdraw Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <BanknotesIcon className="w-8 h-8 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Withdrawal Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{getCurrencySymbol()}</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount || ''}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Reason for withdrawal..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5" />
                <p className="text-sm">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Processing...' : 'Create Withdrawal'}
            </button>
          </form>
        </div>

        {/* Information Panel */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Important Information</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex gap-2">
              <span className="font-medium">•</span>
              <p>
                All withdrawals are recorded as negative transactions in the cashbook
              </p>
            </div>
            <div className="flex gap-2">
              <span className="font-medium">•</span>
              <p>
                Please ensure you count the cash accurately before recording the withdrawal
              </p>
            </div>
            <div className="flex gap-2">
              <span className="font-medium">•</span>
              <p>
                Provide a clear and detailed reason in the notes field for audit purposes
              </p>
            </div>
            <div className="flex gap-2">
              <span className="font-medium">•</span>
              <p>
                All withdrawals require proper authorization and should be documented
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-blue-300">
            <h4 className="font-semibold text-blue-900 mb-2">Shop Information</h4>
            <p className="text-sm text-blue-800">Shop ID: {shopId}</p>
          </div>
        </div>
      </div>

      {/* Recent Withdrawals Section */}
      <div className="mt-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-gray-500" />
            Recent Withdrawals
          </h3>
          
          {loadingRecent ? (
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : recentWithdrawals.length > 0 ? (
            <div className="space-y-3">
              {recentWithdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        {withdrawal.paymentMethod === 'cash' ? (
                          <BanknotesIcon className="w-5 h-5 text-orange-600" />
                        ) : (
                          <CheckCircleIcon className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {withdrawal.notes}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(withdrawal.createdAt), 'MMM dd, yyyy HH:mm')} • {' '}
                          <span className="capitalize">{withdrawal.paymentMethod}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600">
                      {formatCurrency(withdrawal.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent withdrawals</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
