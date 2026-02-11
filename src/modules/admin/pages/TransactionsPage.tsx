// src/modules/admin/pages/TransactionsPage.tsx
import { useState, useEffect } from 'react';
import { CashbookService } from '@/modules/admin/services/cashbookService';
import TransactionFilters from '@/modules/admin/components/TransactionFilters';
import TransactionTable from '@/modules/admin/components/TransactionTable';
import { Card, CardContent } from '@/components/ui';
import type { Transaction, TransactionFilters as TFilters, TransactionsResponse } from '@/types/transaction';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TFilters>({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const itemsPerPage = 20;

  // Get shopId from localStorage or default to 3
  const shopId = Number(localStorage.getItem('shopId')) || 3;

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response: TransactionsResponse = await CashbookService.getTransactions(
        shopId,
        currentPage,
        itemsPerPage,
        filters
      );

      setTransactions(response.transactions);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setHasNextPage(response.hasNextPage);
      setHasPreviousPage(response.hasPreviousPage);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount and when page or filters change
  useEffect(() => {
    fetchTransactions();
  }, [currentPage, filters]);

  const handleFilterChange = (newFilters: TFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <p className="text-neutral-600">
          View and manage all your cashbook transactions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="md">
          <CardContent>
            <div className="text-sm font-medium text-neutral-500">Total Transactions</div>
            <div className="mt-2 text-2xl font-bold text-neutral-900">{total}</div>
          </CardContent>
        </Card>
        <Card padding="md">
          <CardContent>
            <div className="text-sm font-medium text-neutral-500">Current Page</div>
            <div className="mt-2 text-2xl font-bold text-neutral-900">
              {currentPage} / {totalPages}
            </div>
          </CardContent>
        </Card>
        <Card padding="md">
          <CardContent>
            <div className="text-sm font-medium text-neutral-500">Items Per Page</div>
            <div className="mt-2 text-2xl font-bold text-neutral-900">{itemsPerPage}</div>
          </CardContent>
        </Card>
        <Card padding="md">
          <CardContent>
            <div className="text-sm font-medium text-neutral-500">Shop ID</div>
            <div className="mt-2 text-2xl font-bold text-neutral-900">{shopId}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <TransactionFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Error Message */}
      {error && (
        <Card variant="bordered" padding="md" className="bg-red-50 border-red-200">
          <p className="font-semibold text-red-900">Error loading transactions</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </Card>
      )}

      {/* Transactions Table */}
      <TransactionTable transactions={transactions} isLoading={isLoading} />

      {/* Pagination */}
      {!isLoading && transactions.length > 0 && (
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPreviousPage}
                className="relative inline-flex items-center px-4 py-2 border border-neutral-200 text-sm font-medium rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-neutral-200 text-sm font-medium rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-neutral-700">
                  Showing{' '}
                  <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, total)}
                  </span>{' '}
                  of <span className="font-medium">{total}</span> results
                </p>
              </div>
              <div>
                <nav className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPreviousPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  
                  {/* Page Numbers */}
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNumber
                              ? 'bg-primary-50 border-primary-200 text-primary-700 font-semibold'
                              : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return (
                        <span
                          key={pageNumber}
                          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-500"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
