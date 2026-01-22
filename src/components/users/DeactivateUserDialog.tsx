import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { User } from '@/types';

interface DeactivateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  isCurrentUser?: boolean;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeactivateUserDialog({
  open,
  onOpenChange,
  user,
  isCurrentUser = false,
  onConfirm,
  isLoading = false,
}: DeactivateUserDialogProps) {
  if (!user) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate User</AlertDialogTitle>
          <AlertDialogDescription>
            {isCurrentUser ? (
              <>
                <strong className="text-destructive">Warning: You are about to deactivate your own account!</strong>
                <br /><br />
                This action will immediately log you out and you will lose access to the admin portal. You will need
                another administrator to reactivate your account.
                <br /><br />
                Are you sure you want to proceed?
              </>
            ) : (
              <>
                Are you sure you want to deactivate <strong>{user.name}</strong>?
                <br /><br />
                The user will lose access to the admin portal immediately.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={isCurrentUser ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {isLoading ? 'Deactivating...' : 'Deactivate User'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
