import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Transaction, TransactionFilters, TransactionStatus, NetworkProvider } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, Filter, Eye, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { TransactionFiltersModal } from '@/components/transactions/TransactionFiltersModal';
import { TransactionExportModal } from '@/components/transactions/TransactionExportModal';
import { TransactionDetailsModal } from '@/components/transactions/TransactionDetailsModal';
import { transactionsService } from '@/services/transactions.service';
import { Skeleton } from '@/components/ui/skeleton';
import { usePermissions, PERMISSIONS } from '@/hooks/use-permissions';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

const getStatusBadge = (status: TransactionStatus) => {
  const variants: Record<string, string> = {
    SUCCESS: 'bg-success/10 text-success border-success/20',
    PENDING: 'bg-warning/10 text-warning border-warning/20',
    FAILED: 'bg-destructive/10 text-destructive border-destructive/20',
  };
  return variants[status] || variants.PENDING;
};

const Transactions = () => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 10,
  });

  // Modal states
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Build query params
  const queryParams: TransactionFilters = {
    ...filters,
    page: filters.page || 1,
    limit: filters.limit || 10,
  };

  // Add search to customer number filter if search is provided
  if (search) {
    queryParams.customerNumber = search;
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['transactions', queryParams],
    queryFn: () => transactionsService.getTransactions(queryParams),
  });

  const transactions = data?.data?.data || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.metadata?.pagination?.totalPages || 1;
  const currentPage = filters.page || 1;

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleApplyFilters = (newFilters: TransactionFilters) => {
    setFilters({ ...newFilters, page: 1 }); // Reset to page 1 when filters change
    setFiltersModalOpen(false);
  };

  const activeFiltersCount = Object.values(filters).filter((v) => v !== undefined && v !== '' && v !== null && v !== 1 && v !== 10).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">View and manage payment transactions</p>
        </div>
        <PermissionGuard permission={PERMISSIONS.TRANSACTIONS_EXPORT}>
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
              <p className="text-destructive">Failed to load transactions. Please try again.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Customer Number</TableHead>
                      <TableHead>Network</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((t) => (
                        <TableRow key={t.transactionId}>
                          <TableCell className="font-mono text-sm">{t.transactionId}</TableCell>
                          <TableCell>{t.customerNumber}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{t.network}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            GHS {typeof t.amount === 'number' ? t.amount.toFixed(2) : parseFloat(t.amount || '0').toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadge(t.paymentStatus)}>
                              {t.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(t.dateTime), 'dd MMM yyyy, h:mma')}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <PermissionGuard permission={PERMISSIONS.TRANSACTIONS_SHOW}>
                                  <DropdownMenuItem onClick={() => handleViewDetails(t)}>
                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                  </DropdownMenuItem>
                                </PermissionGuard>
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
                    {Math.min(currentPage * (filters.limit || 10), total)} of {total} transactions
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
      <TransactionFiltersModal
        open={filtersModalOpen}
        onOpenChange={setFiltersModalOpen}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />
      <TransactionExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        filters={filters}
      />
      <TransactionDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default Transactions;
