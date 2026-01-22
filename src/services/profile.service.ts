import apiClient from '@/lib/api-client';
import { ApiResponse, User, UpdateProfileData, ChangePasswordData } from '@/types';

/**
 * Profile Service
 * Handles profile-related API calls
 */
export const profileService = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/admin/profile');
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<User>> {
    const response = await apiClient.patch<ApiResponse<User>>('/admin/profile', data);
    return response.data;
  },

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>('/admin/profile/change-password', data);
    return response.data;
  },
};
