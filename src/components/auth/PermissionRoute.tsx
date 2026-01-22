import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions, PERMISSIONS } from '@/hooks/use-permissions';
import type { Permission } from '@/hooks/use-permissions';

interface PermissionRouteProps {
  children: ReactNode;
  permission: Permission | string;
  fallbackPath?: string;
}

/**
 * Route component that checks permission before rendering
 * Redirects to fallback path or first available page if user doesn't have permission
 */
export const PermissionRoute = ({
  children,
  permission,
  fallbackPath,
}: PermissionRouteProps) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    // Try to find the first page the user has access to
    const availablePages = [
      { path: '/dashboard', permission: PERMISSIONS.DASHBOARD_SHOW },
      { path: '/entries', permission: PERMISSIONS.AUDITIONS_INDEX },
      { path: '/transactions', permission: PERMISSIONS.TRANSACTIONS_INDEX },
      { path: '/users', permission: PERMISSIONS.USERS_INDEX },
      { path: '/settings', permission: PERMISSIONS.SETTINGS_INDEX },
    ];

    const firstAvailablePage = availablePages.find((page) => hasPermission(page.permission));
    const redirectPath = fallbackPath || firstAvailablePage?.path || '/profile';

    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
