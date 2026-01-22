import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Entry, PaymentStatus, SmsStatus } from '@/types';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { entriesService } from '@/services/entries.service';
import { Skeleton } from '@/components/ui/skeleton';

interface EntryDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: Entry | null;
}

const getPaymentBadge = (status: PaymentStatus) => {
  const variants: Record<string, string> = {
    PAID: 'bg-success/10 text-success border-success/20',
    PENDING: 'bg-warning/10 text-warning border-warning/20',
    FAILED: 'bg-destructive/10 text-destructive border-destructive/20',
    CANCELLED: 'bg-muted text-muted-foreground border-muted',
  };
  return variants[status] || variants.PENDING;
};

const getSmsBadge = (status: SmsStatus) => {
  const variants: Record<string, string> = {
    SENT: 'bg-success/10 text-success border-success/20',
    DELIVERED: 'bg-success/10 text-success border-success/20',
    PENDING: 'bg-muted text-muted-foreground border-muted',
    FAILED: 'bg-destructive/10 text-destructive border-destructive/20',
  };
  return variants[status] || variants.PENDING;
};

export function EntryDetailsModal({ open, onOpenChange, entry }: EntryDetailsModalProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['entry-details', entry?.id],
    queryFn: () => entriesService.getEntry(entry!.id),
    enabled: open && !!entry,
  });

  const details = data?.data;

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Entry Details</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : details ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Audition ID</p>
                <p className="font-mono font-medium">{details.auditionId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Region</p>
                <p className="font-medium">{details.region}</p>
              </div>
            </div>
            {details.position && (
              <div>
                <p className="text-xs text-muted-foreground">Position</p>
                <p className="font-medium">{details.position}</p>
              </div>
            )}

            <Separator />

            <div>
              <p className="text-sm font-semibold mb-2">Participant Information</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium">{details.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Age</p>
                  <p className="font-medium">{details.age} years</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{details.number}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-semibold mb-2">Payment Information</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-medium text-lg">
                    GHS {typeof details.amount === 'number' ? details.amount.toFixed(2) : parseFloat(details.amount || '0').toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="outline" className={getPaymentBadge(details.paymentStatus)}>
                    {details.paymentStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transaction ID</p>
                  <p className="font-mono text-sm">{details.transactionId || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">SMS Information</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">SMS Status</p>
                  <Badge variant="outline" className={getSmsBadge(details.smsStatus)}>
                    {details.smsStatus ? details.smsStatus.replace('_', ' ') : 'N/A'}
                  </Badge>
                </div>
                {details.processingId && (
                  <div>
                    <p className="text-xs text-muted-foreground">Processing ID</p>
                    <p className="font-mono font-medium">{details.processingId}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Registration Date & Time</p>
                <p className="font-medium">{format(new Date(details.dateTime), 'dd MMM yyyy, h:mma')}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            Failed to load entry details
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
