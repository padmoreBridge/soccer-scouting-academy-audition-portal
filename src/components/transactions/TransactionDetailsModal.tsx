import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Transaction, TransactionStatus } from '@/types';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { transactionsService } from '@/services/transactions.service';
import { Skeleton } from '@/components/ui/skeleton';

interface TransactionDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

const getStatusBadge = (status: TransactionStatus) => {
  const variants: Record<string, string> = {
    SUCCESS: 'bg-success/10 text-success border-success/20',
    PENDING: 'bg-warning/10 text-warning border-warning/20',
    FAILED: 'bg-destructive/10 text-destructive border-destructive/20',
  };
  return variants[status] || variants.PENDING;
};

export function TransactionDetailsModal({ open, onOpenChange, transaction }: TransactionDetailsModalProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['transaction-details', transaction?.transactionId],
    queryFn: () => transactionsService.getTransaction(transaction!.transactionId),
    enabled: open && !!transaction,
  });

  const details = data?.data || transaction;

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
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
                <p className="text-xs text-muted-foreground">Transaction ID</p>
                <p className="font-mono font-medium">{details.transactionId}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-semibold mb-2">Customer Information</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{details.customerNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Network</p>
                  <Badge variant="secondary">{details.network}</Badge>
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
                  <Badge variant="outline" className={getStatusBadge(details.paymentStatus)}>
                    {details.paymentStatus}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Transaction Date & Time</p>
                <p className="font-medium">{format(new Date(details.dateTime), 'dd MMM yyyy, h:mma')}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            Failed to load transaction details
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
