// src/modules/admin/components/TransactionTable.tsx
import { format } from 'date-fns';
import { formatCurrencyWithSign } from '@/utils/currency';
import type { Transaction } from '@/types/transaction';
import {
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  BanknotesIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export default function TransactionTable({ transactions, isLoading }: TransactionTableProps) {
  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'sale':
      case 'deposit':
        return <ArrowDownCircleIcon className="w-5 h-5 text-green-500" />;
      case 'return':
      case 'withdraw':
        return <ArrowUpCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'bg-green-100 text-green-800';
      case 'return':
        return 'bg-red-100 text-red-800';
      case 'withdraw':
        return 'bg-orange-100 text-orange-800';
      case 'deposit':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAmountColor = (amount: number) => {
    return amount >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold';
  };

  const formatAmount = (amount: number) => {
    return formatCurrencyWithSign(amount);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{transaction.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    <div className="font-medium">
                      {format(new Date(transaction.transactionDate), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {format(new Date(transaction.createdAt), 'HH:mm:ss')}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getTransactionTypeIcon(transaction.type)}
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getTransactionTypeColor(
                        transaction.type
                      )}`}
                    >
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {transaction.paymentMethod === 'cash' ? (
                      <BanknotesIcon className="w-5 h-5 text-gray-500" />
                    ) : (
                      <CreditCardIcon className="w-5 h-5 text-gray-500" />
                    )}
                    <span className="text-sm text-gray-700 capitalize">
                      {transaction.paymentMethod}
                    </span>
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${getAmountColor(transaction.amount)}`}>
                  {formatAmount(transaction.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.orderId ? (
                    <span className="text-primary-600 font-medium">#{transaction.orderId}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {transaction.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
