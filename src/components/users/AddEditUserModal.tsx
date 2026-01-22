import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/types';
import { usersService } from '@/services/users.service';
import { rolesService } from '@/services/roles.service';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';

interface AddEditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSave: () => void;
}

export function AddEditUserModal({ open, onOpenChange, user, onSave }: AddEditUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleId: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch roles
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesService.getRoles(),
    enabled: open && !user, // Only fetch when modal is open and creating new user
  });

  const roles = rolesData?.data?.data || [];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        roleId: user.roles?.[0]?.id || '',
        password: '',
        confirmPassword: '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        roleId: '',
        password: '',
        confirmPassword: '',
      });
    }
    setPasswordError('');
  }, [user, open]);

  // Validate password match
  useEffect(() => {
    if (formData.password && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('Passwords do not match');
      } else {
        setPasswordError('');
      }
    } else if (formData.confirmPassword && !formData.password) {
      setPasswordError('Please enter password first');
    } else {
      setPasswordError('');
    }
  }, [formData.password, formData.confirmPassword]);

  const createUserMutation = useMutation({
    mutationFn: usersService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      sonnerToast.success('User created successfully');
      onSave();
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        'Failed to create user';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: { name?: string; email?: string; address?: string; phone_number?: string }) =>
      usersService.updateUser(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      sonnerToast.success('User updated successfully');
      onSave();
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        'Failed to update user';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      // Creating new user - validate required fields
      if (!formData.roleId) {
        toast({
          title: 'Error',
          description: 'Please select a role',
          variant: 'destructive',
        });
        return;
      }

      if (!formData.password) {
        toast({
          title: 'Error',
          description: 'Password is required for new users',
          variant: 'destructive',
        });
        return;
      }

      if (formData.password.length < 8) {
        toast({
          title: 'Error',
          description: 'Password must be at least 8 characters',
          variant: 'destructive',
        });
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: 'Error',
          description: 'Passwords do not match',
          variant: 'destructive',
        });
        return;
      }

      // Create new user
      createUserMutation.mutate({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        roleId: formData.roleId,
      });
    } else {
      // Update existing user
      updateUserMutation.mutate({
        name: formData.name,
        email: formData.email,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.roleId}
                onValueChange={(value) => setFormData({ ...formData, roleId: value })}
                disabled={rolesLoading}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder={rolesLoading ? 'Loading roles...' : 'Select a role'} />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!user && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                  minLength={8}
                  className={passwordError ? 'border-destructive' : ''}
                />
                <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                  className={passwordError ? 'border-destructive' : ''}
                />
                {passwordError && (
                  <p className="text-xs text-destructive">{passwordError}</p>
                )}
                {!passwordError && formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-xs text-success">Passwords match</p>
                )}
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createUserMutation.isPending || updateUserMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={createUserMutation.isPending || updateUserMutation.isPending}
          >
            {createUserMutation.isPending || updateUserMutation.isPending
              ? 'Saving...'
              : user
                ? 'Save Changes'
                : 'Add User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
