import apiClient from '@/lib/api-client';
import { ApiResponse, PaginatedResponse, Audition, AuditionDetails, EntryFilters } from '@/types';

/**
 * Entries/Auditions Service
 * Handles all auditions-related API calls
 */
export const entriesService = {
  /**
   * Get all auditions with pagination and filters
   */
  async getEntries(params?: EntryFilters): Promise<ApiResponse<PaginatedResponse<Audition>>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Audition>>>(
      '/admin/auditions',
      { params }
    );
    return response.data;
  },

  /**
   * Get single audition by ID
   */
  async getEntry(id: string): Promise<ApiResponse<AuditionDetails>> {
    const response = await apiClient.get<ApiResponse<AuditionDetails>>(`/admin/auditions/${id}`);
    return response.data;
  },

  /**
   * Resend SMS for an audition
   */
  async resendSms(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>(`/admin/auditions/${id}/sms/resend`);
    return response.data;
  },

  /**
   * Export auditions as CSV
   */
  async exportEntries(params?: EntryFilters): Promise<Blob> {
    const response = await apiClient.get('/admin/auditions/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
