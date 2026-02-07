// src/modules/admin/services/cashbookService.ts
import apiClient from '@/lib/api-client';
import type { 
  TransactionsResponse, 
  TransactionFilters,
  CreateWithdrawRequest,
  DaySummary
} from '@/types/transaction';

export class CashbookService {
  /**
   * Get all transactions with pagination and filters
   */
  static async getTransactions(
    shopId: number,
    page: number = 1,
    limit: number = 20,
    filters?: TransactionFilters
  ): Promise<TransactionsResponse> {
    const params = new URLSearchParams({
      shopId: shopId.toString(),
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.type) {
      params.append('type', filters.type);
    }
    if (filters?.paymentMethod) {
      params.append('paymentMethod', filters.paymentMethod);
    }
    if (filters?.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate);
    }

    const response = await apiClient.get<TransactionsResponse>(
      `/cashbook/transactions?${params.toString()}`
    );
    return response;
  }

  /**
   * Create a withdrawal transaction
   */
  static async createWithdrawal(
    shopId: number,
    data: CreateWithdrawRequest
  ): Promise<any> {
    const response = await apiClient.post(
      `/cashbook/transactions/withdrawal`,
      {
        shopId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      }
    );
    return response;
  }

  /**
   * Get day summary for a specific date
   */
  static async getDaySummary(
    shopId: number,
    date?: string
  ): Promise<DaySummary> {
    const params = new URLSearchParams({
      shopId: shopId.toString(),
    });

    if (date) {
      params.append('date', date);
    }

    const response = await apiClient.get<DaySummary>(
      `/cashbook/summary/daily?${params.toString()}`
    );
    return response;
  }

  /**
   * Get transaction by ID
   */
  static async getTransactionById(id: number): Promise<any> {
    const response = await apiClient.get(`/cashbook/transactions/${id}`);
    return response;
  }
}

export default CashbookService;
