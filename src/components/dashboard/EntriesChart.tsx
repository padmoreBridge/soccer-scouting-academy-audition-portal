import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface EntriesChartProps {
  data: { date: string; entries: number }[];
}

export function EntriesChart({ data }: EntriesChartProps) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Entries Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(213, 55%, 23%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(213, 55%, 23%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: 'hsl(213, 15%, 45%)' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(213, 15%, 45%)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(0, 0%, 100%)',
                  border: '1px solid hsl(213, 20%, 88%)',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="entries"
                stroke="hsl(213, 55%, 23%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEntries)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
