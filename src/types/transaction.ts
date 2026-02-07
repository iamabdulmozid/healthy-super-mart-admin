// src/types/transaction.ts

export interface Transaction {
  id: number;
  shopId: number;
  userId: number;
  orderId: number | null;
  type: 'sale' | 'return' | 'withdraw' | 'deposit';
  paymentMethod: 'cash' | 'card';
  amount: number;
  notes: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface TransactionFilters {
  type?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface CreateWithdrawRequest {
  amount: number;
  paymentMethod: 'cash' | 'card';
  notes: string;
}

export interface DaySummary {
  id: number;
  shopId: number;
  summaryDate: string;
  openingBalanceCash: number;
  openingBalanceCard: number;
  totalSalesCash: number;
  totalSalesCard: number;
  totalReturnsCash: number;
  totalReturnsCard: number;
  totalWithdrawalsCash: number;
  totalWithdrawalsCard: number;
  closingBalanceCash: number;
  closingBalanceCard: number;
  isFinalized: boolean;
  createdAt: string;
  updatedAt: string;
}
