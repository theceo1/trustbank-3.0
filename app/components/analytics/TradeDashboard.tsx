import { formatCurrency } from '@/app/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LineChart } from '@/app/components/ui/charts';
import { MetricCard } from '@/app/components/ui/metric-card';
import { useTradeMetrics } from '@/app/hooks/useTradeMetrics';
import { Skeleton } from '@/components/ui/skeleton';

export function TradeDashboard({ userId }: { userId: string }) {
  const { data, isLoading } = useTradeMetrics(userId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="col-span-full">
        <CardHeader>
          <h2 className="text-2xl font-semibold">Trading Performance</h2>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <LineChart 
              data={data?.volumeHistory} 
              className="h-[300px]"
              gradient
            />
          )}
        </CardContent>
      </Card>

      <MetricCard
        title="Success Rate"
        value={isLoading ? undefined : `${data?.successRate}%`}
        trend={data?.successRateTrend}
        icon="chart-up"
        loading={isLoading}
      />

      <MetricCard
        title="Total Volume"
        value={isLoading ? undefined : formatCurrency(data?.totalVolume)}
        trend={data?.volumeTrend}
        icon="dollar-sign"
        loading={isLoading}
      />

      <MetricCard
        title="Average Trade"
        value={isLoading ? undefined : formatCurrency(data?.averageTradeSize)}
        trend={data?.sizeTrend}
        icon="trending-up"
        loading={isLoading}
      />
    </div>
  );
}