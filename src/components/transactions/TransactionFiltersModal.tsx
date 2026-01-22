import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { TransactionFilters } from '@/types';

interface TransactionFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: TransactionFilters;
  onApplyFilters: (filters: TransactionFilters) => void;
}

export function TransactionFiltersModal({ open, onOpenChange, filters, onApplyFilters }: TransactionFiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters);

  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
  }, [open, filters]);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onOpenChange(false);
  };

  const handleClear = () => {
    const cleared: TransactionFilters = { page: 1, limit: 10 };
    setLocalFilters(cleared);
    onApplyFilters(cleared);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Transactions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Customer Number</Label>
            <Input
              placeholder="Search by phone number"
              value={localFilters.customerNumber || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, customerNumber: e.target.value || undefined })}
            />
          </div>

          <div className="space-y-2">
            <Label>Network Provider</Label>
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
            <Label>Status</Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Amount (GHS)</Label>
              <Input
                type="number"
                placeholder="0"
                value={localFilters.minAmount || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, minAmount: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Amount (GHS)</Label>
              <Input
                type="number"
                placeholder="1000"
                value={localFilters.maxAmount || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, maxAmount: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date From</Label>
              <Input
                type="datetime-local"
                value={localFilters.startDate ? new Date(localFilters.startDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label>Date To</Label>
              <Input
                type="datetime-local"
                value={localFilters.endDate ? new Date(localFilters.endDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select
                value={localFilters.sortBy || 'created_at'}
                onValueChange={(value) => setLocalFilters({ ...localFilters, sortBy: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="updated_at">Date Updated</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="network">Network</SelectItem>
                  <SelectItem value="customer_number">Customer Number</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Select
                value={localFilters.sortOrder || 'DESC'}
                onValueChange={(value) => setLocalFilters({ ...localFilters, sortOrder: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASC">Ascending</SelectItem>
                  <SelectItem value="DESC">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClear}>Clear All</Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
