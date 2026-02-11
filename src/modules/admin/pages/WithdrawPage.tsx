// src/modules/admin/pages/WithdrawPage.tsx
import { useState, useEffect } from 'react';
import { CashbookService } from '@/modules/admin/services/cashbookService';
import { formatCurrency, getCurrencySymbol } from '@/utils/currency';
import { Card, Button } from '@/components/ui';
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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <p className="text-neutral-600">
          Record a cash withdrawal from the register
        </p>
      </div>

      {/* Today's Withdrawals Summary */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-sm">
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
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <BanknotesIcon className="w-8 h-8 text-primary-600" />
            <h2 className="text-lg font-semibold text-neutral-900">Withdrawal Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">{getCurrencySymbol()}</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount || ''}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full pl-8 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-neutral-900"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-neutral-900 text-sm"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-neutral-900 resize-none"
                placeholder="Reason for withdrawal..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <Card variant="bordered" padding="md" className="bg-red-50 border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </Card>
            )}

            {/* Success Message */}
            {success && (
              <Card variant="bordered" padding="md" className="bg-green-50 border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-700" />
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              isLoading={isLoading}
              className="w-full"
            >
              {isLoading ? 'Processing...' : 'Create Withdrawal'}
            </Button>
          </form>
        </Card>

        {/* Information Panel */}
        <Card variant="bordered" padding="lg" className="bg-primary-50 border-primary-200">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">Important Information</h3>
          <div className="space-y-3 text-sm text-primary-800">
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

          <div className="mt-6 pt-6 border-t border-primary-300">
            <h4 className="font-semibold text-primary-900 mb-2">Shop Information</h4>
            <p className="text-sm text-primary-800">Shop ID: {shopId}</p>
          </div>
        </Card>
      </div>

      {/* Recent Withdrawals Section */}
      <Card padding="lg">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-neutral-600" />
          Recent Withdrawals
        </h3>
        
        {loadingRecent ? (
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-neutral-100 rounded"></div>
            ))}
          </div>
        ) : recentWithdrawals.length > 0 ? (
          <div className="space-y-3">
            {recentWithdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
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
                      <p className="font-medium text-neutral-900 text-sm">
                        {withdrawal.notes}
                      </p>
                      <p className="text-xs text-neutral-500">
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
          <div className="text-center py-8 text-neutral-500">
            <p>No recent withdrawals</p>
          </div>
        )}
      </Card>
    </div>
  );
}
