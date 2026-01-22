import apiClient from '@/lib/api-client';
import { ApiResponse, PaginatedResponse, Transaction, TransactionFilters } from '@/types';

/**
 * Transactions Service
 * Handles all transaction-related API calls
 */
export const transactionsService = {
  /**
   * Get all transactions with pagination and filters
   */
  async getTransactions(params?: TransactionFilters): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Transaction>>>(
      '/admin/transactions',
      { params }
    );
    return response.data;
  },

  /**
   * Get single transaction by ID
   */
  async getTransaction(id: string): Promise<ApiResponse<Transaction>> {
    const response = await apiClient.get<ApiResponse<Transaction>>(`/admin/transactions/${id}`);
    return response.data;
  },

  /**
   * Export transactions as CSV
   */
  async exportTransactions(params?: TransactionFilters): Promise<Blob> {
    const response = await apiClient.get('/admin/transactions/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
