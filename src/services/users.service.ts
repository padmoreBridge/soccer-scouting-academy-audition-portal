import apiClient from '@/lib/api-client';
import { ApiResponse, PaginatedResponse, User, UserFilters } from '@/types';

/**
 * Users Service
 * Handles all user management API calls
 */
export const usersService = {
  /**
   * Get all users with pagination and filters
   */
  async getUsers(params?: UserFilters): Promise<ApiResponse<PaginatedResponse<User>>> {
    const response = await apiClient.get<any>(
      '/admin/users',
      { params }
    );
    // Transform API response to match User type
    const transformedData = {
      ...response.data,
      data: {
        ...response.data.data,
        data: response.data.data.data.map((user: any) => ({
          ...user,
          active_status: user.status === 'active',
        })),
      },
    };
    return transformedData;
  },

  /**
   * Get single user by ID
   */
  async getUser(id: string): Promise<ApiResponse<User>> {
    const response = await apiClient.get<any>(`/admin/users/${id}`);
    // Transform API response to match User type
    const transformedData = {
      ...response.data,
      data: response.data.data
        ? {
            ...response.data.data,
            active_status: response.data.data.status === 'active',
          }
        : null,
    };
    return transformedData;
  },

  /**
   * Create new user
   */
  async createUser(data: {
    name: string;
    email: string;
    password: string;
    roleId?: string;
    address?: string;
    phone_number?: string;
  }): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>('/admin/users', data);
    return response.data;
  },

  /**
   * Update user
   */
  async updateUser(id: string, data: {
    name?: string;
    email?: string;
    address?: string;
    phone_number?: string;
  }): Promise<ApiResponse<User>> {
    const response = await apiClient.patch<ApiResponse<User>>(`/admin/users/${id}`, data);
    return response.data;
  },

  /**
   * Activate user
   */
  async activateUser(id: string): Promise<ApiResponse<User>> {
    const response = await apiClient.patch<any>(`/admin/users/${id}/activate`);
    // Transform API response to match User type
    const transformedData = {
      ...response.data,
      data: response.data.data
        ? {
            ...response.data.data,
            active_status: response.data.data.status === 'active' || response.data.data.active_status === true,
          }
        : null,
    };
    return transformedData;
  },

  /**
   * Deactivate user
   */
  async deactivateUser(id: string): Promise<ApiResponse<User>> {
    const response = await apiClient.patch<any>(`/admin/users/${id}/deactivate`);
    // Transform API response to match User type
    const transformedData = {
      ...response.data,
      data: response.data.data
        ? {
            ...response.data.data,
            active_status: response.data.data.status === 'active' || response.data.data.active_status === true,
          }
        : null,
    };
    return transformedData;
  },

  /**
   * Delete user (soft delete)
   */
  async deleteUser(id: string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/admin/users/${id}`);
    return response.data;
  },
};
