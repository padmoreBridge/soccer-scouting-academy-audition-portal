import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Entry } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface RecentEntriesTableProps {
  entries: Entry[];
}

const getPaymentStatusBadge = (status: Entry['paymentStatus']) => {
  const variants = {
    paid: 'bg-success/10 text-success border-success/20',
    pending: 'bg-warning/10 text-warning border-warning/20',
    failed: 'bg-destructive/10 text-destructive border-destructive/20',
  };
  return variants[status];
};

export function RecentEntriesTable({ entries }: RecentEntriesTableProps) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                  ID
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                  Participant
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                  Customer Number
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                  Payment
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.slice(0, 5).map((entry) => (
                <tr key={entry.id} className="border-b last:border-0">
                  <td className="py-3 px-2 text-sm font-mono">{entry.id}</td>
                  <td className="py-3 px-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{entry.participantName}</span>
                      <span className="text-xs text-muted-foreground">Age: {entry.age}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-sm">{entry.phoneNumber}</td>
                  <td className="py-3 px-2">
                    <Badge variant="outline" className={getPaymentStatusBadge(entry.paymentStatus)}>
                      {entry.paymentStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-sm text-muted-foreground">
                    {format(new Date(entry.createdAt), 'MMM dd, HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
