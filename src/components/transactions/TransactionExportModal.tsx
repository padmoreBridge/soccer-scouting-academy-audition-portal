import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { TransactionFilters } from '@/types';
import { transactionsService } from '@/services/transactions.service';
import { toast as sonnerToast } from 'sonner';
import { FileText } from 'lucide-react';

interface TransactionExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters?: TransactionFilters;
}

export function TransactionExportModal({ open, onOpenChange, filters = {} }: TransactionExportModalProps) {
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
  }, [open, filters]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await transactionsService.exportTransactions(localFilters);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      sonnerToast.success('Transactions exported successfully');
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to export transactions';
      sonnerToast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Transactions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Export Format</Label>
            <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm">CSV (.csv)</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Transactions will be exported as CSV format
            </p>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Filter Data (Optional)</p>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Network Provider</Label>
                <Select
                  value={localFilters.network || ''}
                  onValueChange={(value) => setLocalFilters({ ...localFilters, network: value as any || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All networks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MTN">MTN</SelectItem>
                    <SelectItem value="VOD">Vodafone</SelectItem>
                    <SelectItem value="AIR">AirtelTigo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Status</Label>
                <Select
                  value={localFilters.status || ''}
                  onValueChange={(value) => setLocalFilters({ ...localFilters, status: value as any || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUCCESS">Success</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Customer Number</Label>
                <Input
                  placeholder="Search by phone number"
                  value={localFilters.customerNumber || ''}
                  onChange={(e) => setLocalFilters({ ...localFilters, customerNumber: e.target.value || undefined })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Min Amount</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={localFilters.minAmount || ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, minAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Max Amount</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={localFilters.maxAmount || ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, maxAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Date From</Label>
                  <Input
                    type="datetime-local"
                    value={localFilters.startDate ? new Date(localFilters.startDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Date To</Label>
                  <Input
                    type="datetime-local"
                    value={localFilters.endDate ? new Date(localFilters.endDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
