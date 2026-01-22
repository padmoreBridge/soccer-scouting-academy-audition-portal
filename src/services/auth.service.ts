import apiClient from '@/lib/api-client';
import { ApiResponse, LoginResponse } from '@/types';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export const authService = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/admin/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> {
    const response = await apiClient.post<ApiResponse<{ accessToken: string }>>(
      '/admin/auth/refresh',
      { refreshToken }
    );
    return response.data;
  },

  /**
   * Request password reset link
   */
  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>('/admin/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  /**
   * Reset password using token from email
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>('/admin/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },

  /**
   * Logout user and revoke refresh token
   */
  async logout(refreshToken: string): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>('/admin/auth/logout', {
      refreshToken,
    });
    return response.data;
  },
};
