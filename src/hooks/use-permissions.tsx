import { useAuth } from '@/contexts/AuthContext';

/**
 * Permission names used in the system
 */
export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_SHOW: 'dashboard.show',
  
  // Auditions
  AUDITIONS_INDEX: 'auditions.index',
  AUDITIONS_SHOW: 'auditions.show',
  AUDITIONS_RESENDSMS: 'auditions.resendsms',
  AUDITIONS_EXPORT: 'auditions.export',
  
  // Transactions
  TRANSACTIONS_INDEX: 'transactions.index',
  TRANSACTIONS_SHOW: 'transactions.show',
  TRANSACTIONS_EXPORT: 'transactions.export',
  
  // Users
  USERS_INDEX: 'users.index',
  USERS_SHOW: 'users.show',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_ACTIVATE: 'users.activate',
  USERS_DEACTIVATE: 'users.deactivate',
  USERS_DELETE: 'users.delete',
  
  // Settings
  SETTINGS_INDEX: 'settings.index',
  SETTINGS_EDIT: 'settings.edit',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Hook to check user permissions
 */
export const usePermissions = () => {
  const { user } = useAuth();

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: Permission | string): boolean => {
    if (!user || !user.permissions) {
      return false;
    }

    // Check if user has the permission directly
    if (user.permissions.includes(permission)) {
      return true;
    }

    // Check if user has the permission through roles
    if (user.roles) {
      for (const role of user.roles) {
        if (role.permissions?.some((p) => p.name === permission)) {
          return true;
        }
      }
    }

    return false;
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissions: (Permission | string)[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissions: (Permission | string)[]): boolean => {
    return permissions.every((permission) => hasPermission(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: user?.permissions || [],
  };
};
