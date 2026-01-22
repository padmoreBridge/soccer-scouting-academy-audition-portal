import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, UserFilters } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, Trash2, MoreHorizontal, ChevronLeft, ChevronRight, Power, PowerOff } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { AddEditUserModal } from '@/components/users/AddEditUserModal';
import { DeleteUserDialog } from '@/components/users/DeleteUserDialog';
import { ActivateUserDialog } from '@/components/users/ActivateUserDialog';
import { DeactivateUserDialog } from '@/components/users/DeactivateUserDialog';
import { usersService } from '@/services/users.service';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePermissions, PERMISSIONS } from '@/hooks/use-permissions';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

const Users = () => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
    name: search,
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  // Modal states
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Update filters when search changes
  const queryParams: UserFilters = {
    ...filters,
    page: filters.page || 1,
    limit: filters.limit || 10,
    name: search || undefined,
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', queryParams],
    queryFn: () => usersService.getUsers(queryParams),
  });

  const deleteUserMutation = useMutation({
    mutationFn: usersService.deleteUser,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      sonnerToast.success('User deleted successfully');
      setDeleteDialogOpen(false);
      
      // If current user deleted themselves, logout
      if (selectedUser && currentUser && selectedUser.id === currentUser.id) {
        await logout();
        navigate('/login');
      }
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        'Failed to delete user';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const activateUserMutation = useMutation({
    mutationFn: usersService.activateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      sonnerToast.success('User activated successfully');
      setActivateDialogOpen(false);
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        'Failed to activate user';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const deactivateUserMutation = useMutation({
    mutationFn: usersService.deactivateUser,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      sonnerToast.success('User deactivated successfully');
      setDeactivateDialogOpen(false);
      
      // If current user deactivated themselves, logout
      if (selectedUser && currentUser && selectedUser.id === currentUser.id) {
        await logout();
        navigate('/login');
      }
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        'Failed to deactivate user';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const users = data?.data?.data || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.metadata?.pagination?.totalPages || 1;
  const currentPage = filters.page || 1;

  const handleAddUser = () => {
    setSelectedUser(null);
    setAddEditModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setAddEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleSaveUser = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    setAddEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const handleActivateUser = (user: User) => {
    setSelectedUser(user);
    setActivateDialogOpen(true);
  };

  const handleDeactivateUser = (user: User) => {
    setSelectedUser(user);
    setDeactivateDialogOpen(true);
  };

  const handleConfirmActivate = () => {
    if (selectedUser) {
      activateUserMutation.mutate(selectedUser.id);
    }
  };

  const handleConfirmDeactivate = () => {
    if (selectedUser) {
      deactivateUserMutation.mutate(selectedUser.id);
    }
  };

  const isCurrentUser = (user: User) => {
    return currentUser && user.id === currentUser.id;
  };

  const isSuperUser = (user: User) => {
    return user.roles?.some((role) => role.name === 'SUPER_ADMIN') || false;
  };

  const isCurrentUserSuperUser = () => {
    return currentUser?.roles?.some((role) => role.name === 'SUPER_ADMIN') || false;
  };

  const canModifyUser = (user: User) => {
    // If user is a Super User, only Super Users can modify them
    if (isSuperUser(user)) {
      return isCurrentUserSuperUser();
    }
    // For non-Super Users, check permissions normally
    return true;
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage admin users and their roles</p>
        </div>
        <PermissionGuard permission={PERMISSIONS.USERS_CREATE}>
          <Button className="gap-2" onClick={handleAddUser}>
            <Plus className="h-4 w-4" /> Add User
          </Button>
        </PermissionGuard>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setFilters({ ...filters, name: e.target.value || undefined, page: 1 });
              }}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-destructive">Failed to load users. Please try again.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.roles?.[0]?.name === 'SUPER_ADMIN' ? 'default' : 'secondary'}>
                            {user.roles?.[0]?.displayName || 'Admin'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              user.active_status
                                ? 'bg-success/10 text-success border-success/20'
                                : 'bg-muted text-muted-foreground'
                            }
                          >
                            {user.active_status ? 'active' : 'inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canModifyUser(user) && (
                                <PermissionGuard permission={PERMISSIONS.USERS_EDIT}>
                                  <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                </PermissionGuard>
                              )}
                              {!isCurrentUser(user) && canModifyUser(user) && (
                                <>
                                  {user.active_status ? (
                                    <PermissionGuard permission={PERMISSIONS.USERS_DEACTIVATE}>
                                      <DropdownMenuItem
                                        onClick={() => handleDeactivateUser(user)}
                                        disabled={deactivateUserMutation.isPending}
                                      >
                                        <PowerOff className="mr-2 h-4 w-4" /> Deactivate
                                      </DropdownMenuItem>
                                    </PermissionGuard>
                                  ) : (
                                    <PermissionGuard permission={PERMISSIONS.USERS_ACTIVATE}>
                                      <DropdownMenuItem
                                        onClick={() => handleActivateUser(user)}
                                        disabled={activateUserMutation.isPending}
                                      >
                                        <Power className="mr-2 h-4 w-4" /> Activate
                                      </DropdownMenuItem>
                                    </PermissionGuard>
                                  )}
                                  <PermissionGuard permission={PERMISSIONS.USERS_DELETE}>
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => handleDeleteUser(user)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                  </PermissionGuard>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * (filters.limit || 10)) + 1} to{' '}
                    {Math.min(currentPage * (filters.limit || 10), total)} of {total} users
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddEditUserModal
        open={addEditModalOpen}
        onOpenChange={setAddEditModalOpen}
        user={selectedUser}
        onSave={handleSaveUser}
      />
      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={selectedUser}
        isCurrentUser={selectedUser ? isCurrentUser(selectedUser) : false}
        onConfirm={handleConfirmDelete}
        isLoading={deleteUserMutation.isPending}
      />
      <ActivateUserDialog
        open={activateDialogOpen}
        onOpenChange={setActivateDialogOpen}
        user={selectedUser}
        onConfirm={handleConfirmActivate}
        isLoading={activateUserMutation.isPending}
      />
      <DeactivateUserDialog
        open={deactivateDialogOpen}
        onOpenChange={setDeactivateDialogOpen}
        user={selectedUser}
        isCurrentUser={selectedUser ? isCurrentUser(selectedUser) : false}
        onConfirm={handleConfirmDeactivate}
        isLoading={deactivateUserMutation.isPending}
      />
    </div>
  );
};

export default Users;
