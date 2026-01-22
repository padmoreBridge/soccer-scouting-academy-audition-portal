import apiClient from '@/lib/api-client';
import { ApiResponse, PaginatedResponse, Role } from '@/types';

/**
 * Roles Service
 * Handles role-related API calls
 */
export const rolesService = {
  /**
   * Get all roles
   */
  async getRoles(): Promise<ApiResponse<PaginatedResponse<Role>>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Role>>>('/admin/roles');
    return response.data;
  },
};
