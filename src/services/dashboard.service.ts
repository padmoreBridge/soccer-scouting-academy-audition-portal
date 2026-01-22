import apiClient from '@/lib/api-client';
import { ApiResponse, DashboardStats } from '@/types';

/**
 * Dashboard Service
 * Handles dashboard-related API calls
 */
export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats');
    return response.data;
  },
};
