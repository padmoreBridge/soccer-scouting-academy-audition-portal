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
import { Entry } from '@/types';

interface ResendSmsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: Entry | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ResendSmsDialog({ open, onOpenChange, entry, onConfirm, isLoading = false }: ResendSmsDialogProps) {
  if (!entry) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Resend SMS</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to resend the SMS to <strong>{entry.participantName}</strong> at{' '}
            <strong>{entry.phoneNumber}</strong>?
            <br /><br />
            This will send the unique audition code and entry details again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Resend SMS'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
