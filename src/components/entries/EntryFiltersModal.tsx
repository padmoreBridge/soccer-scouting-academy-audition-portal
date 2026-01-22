import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { EntryFilters } from '@/types';

interface EntryFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: EntryFilters;
  onApplyFilters: (filters: EntryFilters) => void;
}

export function EntryFiltersModal({ open, onOpenChange, filters, onApplyFilters }: EntryFiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<EntryFilters>(filters);

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
    const cleared: EntryFilters = { page: 1, limit: 10 };
    setLocalFilters(cleared);
    onApplyFilters(cleared);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Entries</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Audition Code</Label>
            <Input
              placeholder="Search by audition code"
              value={localFilters.processingId || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, processingId: e.target.value || undefined })}
            />
          </div>

          <div className="space-y-2">
            <Label>Position</Label>
            <Input
              placeholder="Filter by soccer position (e.g., Defender, Striker)"
              value={localFilters.position || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, position: e.target.value || undefined })}
            />
          </div>

          <div className="space-y-2">
            <Label>Customer Number</Label>
            <Input
              placeholder="Search by phone number"
              value={localFilters.customerNumber || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, customerNumber: e.target.value || undefined })}
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Status</Label>
            <Select
              value={localFilters.status || ''}
              onValueChange={(value) => setLocalFilters({ ...localFilters, status: value as any || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>SMS Status</Label>
            <Select
              value={localFilters.smsStatus || ''}
              onValueChange={(value) => setLocalFilters({ ...localFilters, smsStatus: value as any || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
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
                value={localFilters.sortBy || 'createdAt'}
                onValueChange={(value) => setLocalFilters({ ...localFilters, sortBy: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="updatedAt">Date Updated</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="age">Age</SelectItem>
                  <SelectItem value="region">Region</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="msisdn">Phone Number</SelectItem>
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
