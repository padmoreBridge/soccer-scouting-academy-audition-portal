import { useQuery } from '@tanstack/react-query';
import {
  ClipboardList,
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { EntriesChart } from '@/components/dashboard/EntriesChart';
import { TransactionPieChart } from '@/components/dashboard/TransactionPieChart';
import { RecentEntriesTable } from '@/components/dashboard/RecentEntriesTable';
import { dashboardService } from '@/services/dashboard.service';
import { format } from 'date-fns';
import { Entry, PaymentStatus } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getDashboardStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchIntervalInBackground: false, // Only refetch when page/tab is active
    refetchOnWindowFocus: true, // Also refetch when window regains focus
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your audition platform.
          </p>
        </div>
        <div className="p-8 text-center">
          <p className="text-destructive">Failed to load dashboard data. Please try again.</p>
        </div>
      </div>
    );
  }

  const stats = data.data;

  // Transform weekly data for chart
  const chartData = stats.weeklyAuditionsData.map((item) => ({
    date: format(new Date(item.date), 'MMM dd'),
    entries: item.count,
  }));

  // Transform transaction status for pie chart
  const transactionChartData = [
    { name: 'Successful', value: stats.transactionStatusCounts.successful, fill: 'hsl(142, 76%, 36%)' },
    { name: 'Pending', value: stats.transactionStatusCounts.pending, fill: 'hsl(38, 92%, 50%)' },
    { name: 'Failed', value: stats.transactionStatusCounts.failed, fill: 'hsl(0, 84%, 60%)' },
  ];

  // Transform recent auditions to Entry format for the table
  const recentEntries: Entry[] = stats.recentAuditions.map((audition) => ({
    id: audition.id,
    participantName: audition.name,
    age: audition.age,
    phoneNumber: audition.msisdn,
    guardianName: '',
    guardianPhone: '',
    paymentStatus: audition.status as PaymentStatus,
    smsStatus: 'SENT' as const,
    status: 'pending' as const,
    createdAt: audition.createdAt,
    amount: 0,
    transactionId: audition.processingId,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your audition platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Auditions"
          value={stats.totalAuditions}
          icon={ClipboardList}
          description="all time"
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          icon={CreditCard}
          description="awaiting confirmation"
          iconClassName="bg-warning/10"
        />
        <StatCard
          title="Successful Transactions"
          value={stats.successfulTransactions.count}
          icon={TrendingUp}
          description="this month"
          trend={{
            value: stats.successfulTransactions.change,
            isPositive: stats.successfulTransactions.change >= 0,
          }}
          iconClassName="bg-success/10"
        />
        <StatCard
          title="Total Revenue"
          value={`GHS ${stats.totalRevenue.amount.toFixed(2)}`}
          icon={DollarSign}
          description="from all transactions"
          trend={{
            value: stats.totalRevenue.change,
            isPositive: stats.totalRevenue.change >= 0,
          }}
          iconClassName="bg-accent/10"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={Users}
          description="admin accounts"
        />
        <StatCard
          title="Today's Auditions"
          value={stats.todayAuditions.count}
          icon={Calendar}
          description="new registrations today"
          trend={{
            value: stats.todayAuditions.change,
            isPositive: stats.todayAuditions.change >= 0,
          }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <EntriesChart data={chartData} />
        <TransactionPieChart data={transactionChartData} />
      </div>

      {/* Recent Entries */}
      <RecentEntriesTable entries={recentEntries} />
    </div>
  );
};

export default Dashboard;
