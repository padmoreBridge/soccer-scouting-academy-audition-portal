import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Entry, EntryFilters, Audition, PaymentStatus, SmsStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, Filter, Eye, Send, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { EntryFiltersModal } from '@/components/entries/EntryFiltersModal';
import { EntryExportModal } from '@/components/entries/EntryExportModal';
import { EntryDetailsModal } from '@/components/entries/EntryDetailsModal';
import { ResendSmsDialog } from '@/components/entries/ResendSmsDialog';
import { entriesService } from '@/services/entries.service';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { usePermissions, PERMISSIONS } from '@/hooks/use-permissions';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

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

// Position mapping - keeping for backward compatibility if needed
// Note: Position is now a free text field in the API, but we can still display it
const getPositionLabel = (position: string | undefined): string => {
  if (!position) return 'N/A';
  return position;
};

// Transform API Audition to Entry format for compatibility
const transformAuditionToEntry = (audition: Audition): Entry => ({
  id: audition.id,
  participantName: audition.name || '',
  age: audition.age || 0,
  position: audition.position || undefined,
  region: audition.region || undefined,
  phoneNumber: audition.customerNumber || '',
  guardianName: '',
  guardianPhone: '',
  paymentStatus: (audition.paymentStatus || 'PENDING') as PaymentStatus,
  smsStatus: (audition.smsSentStatus || 'PENDING') as SmsStatus,
  status: 'pending' as const,
  createdAt: audition.dateTime || new Date().toISOString(),
  amount: 0,
});

const Entries = () => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<EntryFilters>({
    page: 1,
    limit: 10,
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Modal states
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [resendSmsOpen, setResendSmsOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  // Build query params
  const queryParams: EntryFilters = {
    ...filters,
    page: filters.page || 1,
    limit: filters.limit || 10,
  };

  // Add search to customer number filter if search is provided
  if (search) {
    queryParams.customerNumber = search;
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['entries', queryParams],
    queryFn: () => entriesService.getEntries(queryParams),
  });

  const resendSmsMutation = useMutation({
    mutationFn: entriesService.resendSms,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      sonnerToast.success('SMS resent successfully');
      setResendSmsOpen(false);
    },
    onError: (error: unknown) => {
      const errorMessage = 
        (error && typeof error === 'object' && 'response' in error && 
         error.response && typeof error.response === 'object' && 'data' in error.response &&
         error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data
         ? String(error.response.data.message)
         : (error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Failed to resend SMS'));
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const entries = data?.data?.data || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.metadata?.pagination?.totalPages || 1;
  const currentPage = filters.page || 1;

  const transformedEntries = entries.map((audition) => ({
    ...transformAuditionToEntry(audition),
  }));

  const handleViewDetails = (entry: Entry) => {
    setSelectedEntry(entry);
    setDetailsModalOpen(true);
  };

  const handleResendSms = (entry: Entry) => {
    setSelectedEntry(entry);
    setResendSmsOpen(true);
  };

  const handleResendConfirm = () => {
    if (selectedEntry) {
      resendSmsMutation.mutate(selectedEntry.id);
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleApplyFilters = (newFilters: EntryFilters) => {
    setFilters({ ...newFilters, page: 1 }); // Reset to page 1 when filters change
    setFiltersModalOpen(false);
  };

  const activeFiltersCount = Object.values(filters).filter((v) => v !== undefined && v !== '' && v !== null && v !== 1 && v !== 10).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Entries</h1>
          <p className="text-muted-foreground">Manage audition registrations and submissions</p>
        </div>
        <PermissionGuard permission={PERMISSIONS.AUDITIONS_EXPORT}>
          <Button className="gap-2" onClick={() => setExportModalOpen(true)}>
            <Download className="h-4 w-4" /> Export
          </Button>
        </PermissionGuard>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer number..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setFilters({ ...filters, page: 1 }); // Reset to page 1 on search
                }}
                className="pl-9"
              />
            </div>
            <Button variant="outline" className="gap-2" onClick={() => setFiltersModalOpen(true)}>
              <Filter className="h-4 w-4" /> Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
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
              <p className="text-destructive">Failed to load entries. Please try again.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Participant</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Customer Number</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>SMS</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transformedEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No entries found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transformedEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-mono text-sm">{entry.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{entry.participantName}</p>
                              <p className="text-xs text-muted-foreground">Age: {entry.age}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getPositionLabel(entry.position)}</TableCell>
                          <TableCell className="font-mono text-sm">{entry.phoneNumber}</TableCell>
                          <TableCell>{entry.region || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getPaymentBadge(entry.paymentStatus)}>
                              {entry.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getSmsBadge(entry.smsStatus)}>
                              {entry.smsStatus ? entry.smsStatus.replace('_', ' ') : 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(entry.createdAt), 'dd MMM yyyy, h:mma')}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <PermissionGuard permission={PERMISSIONS.AUDITIONS_SHOW}>
                                  <DropdownMenuItem onClick={() => handleViewDetails(entry)}>
                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                  </DropdownMenuItem>
                                </PermissionGuard>
                                {entry.smsStatus !== 'SENT' && entry.smsStatus !== 'DELIVERED' && (
                                  <PermissionGuard permission={PERMISSIONS.AUDITIONS_RESENDSMS}>
                                    <DropdownMenuItem onClick={() => handleResendSms(entry)}>
                                      <Send className="mr-2 h-4 w-4" /> Resend SMS
                                    </DropdownMenuItem>
                                  </PermissionGuard>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * (filters.limit || 10)) + 1} to{' '}
                    {Math.min(currentPage * (filters.limit || 10), total)} of {total} entries
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
      <EntryFiltersModal
        open={filtersModalOpen}
        onOpenChange={setFiltersModalOpen}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />
      <EntryExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        filters={filters}
      />
      <EntryDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        entry={selectedEntry}
      />
      <ResendSmsDialog
        open={resendSmsOpen}
        onOpenChange={setResendSmsOpen}
        entry={selectedEntry}
        onConfirm={handleResendConfirm}
        isLoading={resendSmsMutation.isPending}
      />
    </div>
  );
};

export default Entries;
