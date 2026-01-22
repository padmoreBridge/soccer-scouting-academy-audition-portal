import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { settingsService } from '@/services/settings.service';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { usePermissions, PERMISSIONS } from '@/hooks/use-permissions';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

const Settings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
  });

  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value, description }: { key: string; value: string; description?: string }) =>
      settingsService.updateSetting(key, { value, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      sonnerToast.success('Setting updated successfully');
      setEditingKey(null);
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        'Failed to update setting';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const settings = (data?.success && data?.data) ? data.data : [];

  const handleEdit = (key: string, value: string, description: string) => {
    setEditingKey(key);
    setEditValue(value);
    setEditDescription(description || '');
  };

  const handleSave = (key: string) => {
    if (!editValue.trim()) {
      toast({
        title: 'Error',
        description: 'Value cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    updateSettingMutation.mutate({
      key,
      value: editValue.trim(),
      description: editDescription.trim() || undefined,
    });
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue('');
    setEditDescription('');
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>Configure application-wide settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-2">Failed to load settings</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
            </div>
          ) : settings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No settings found</p>
          ) : (
            settings.map((setting) => (
              <div key={setting.id} className="space-y-4 pb-6 border-b last:border-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Label className="text-base font-semibold">{setting.key}</Label>
                    {setting.description && (
                      <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
                    )}
                  </div>
                  {editingKey !== setting.key && (
                    <PermissionGuard permission={PERMISSIONS.SETTINGS_EDIT}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(setting.key, setting.value, setting.description)}
                      >
                        Edit
                      </Button>
                    </PermissionGuard>
                  )}
                </div>

                {editingKey === setting.key ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`value-${setting.key}`}>Value</Label>
                      <Input
                        id={`value-${setting.key}`}
                        type={setting.key.includes('PASSWORD') || setting.key.includes('SECRET') || setting.key.includes('KEY') ? 'password' : 'text'}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="Enter value"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`description-${setting.key}`}>Description (Optional)</Label>
                      <Textarea
                        id={`description-${setting.key}`}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Enter description"
                        rows={2}
                      />
                    </div>
                    {setting.key === 'AUDITION_AMOUNT' && (
                      <p className="text-xs text-muted-foreground">
                        Note: This amount is used for USSD payment initiation and is stored in GHS (Ghana Cedis).
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSave(setting.key)}
                        disabled={updateSettingMutation.isPending}
                      >
                        {updateSettingMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={updateSettingMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Current Value</Label>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="font-mono text-sm break-all">
                        {setting.key.includes('PASSWORD') || setting.key.includes('SECRET') || setting.key.includes('KEY')
                          ? '••••••••'
                          : setting.value}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
