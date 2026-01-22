import apiClient from '@/lib/api-client';
import { ApiResponse, Setting } from '@/types';

/**
 * Settings Service
 * Handles all settings-related API calls
 */
export const settingsService = {
  /**
   * Get all settings
   */
  async getSettings(): Promise<ApiResponse<Setting[]>> {
    const response = await apiClient.get<ApiResponse<Setting[]>>('/admin/settings');
    return response.data;
  },

  /**
   * Get specific setting by key
   */
  async getSetting(key: string): Promise<ApiResponse<Setting>> {
    const response = await apiClient.get<ApiResponse<Setting>>(`/admin/settings/${key}`);
    return response.data;
  },

  /**
   * Update setting
   */
  async updateSetting(key: string, data: {
    value: string;
    description?: string;
  }): Promise<ApiResponse<Setting>> {
    const response = await apiClient.patch<ApiResponse<Setting>>(`/admin/settings/${key}`, data);
    return response.data;
  },
};
