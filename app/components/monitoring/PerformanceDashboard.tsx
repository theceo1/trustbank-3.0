import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LineChart } from '@/app/components/ui/charts';
import { PerformanceMonitor } from '@/app/lib/services/monitoring/PerformanceMonitor';
import { TrustBankLogo } from '@/app/components/brand/Logo';

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const data = await Promise.all([
        PerformanceMonitor.getAverageProcessingTime('wallet'),
        PerformanceMonitor.getAverageProcessingTime('card'),
        PerformanceMonitor.getAverageProcessingTime('bank')
      ]);

      setMetrics({
        wallet: data[0],
        card: data[1],
        bank: data[2]
      });
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

    function formatTime(arg0: number): import("react").ReactNode {
        throw new Error('Function not implemented.');
    }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex justify-between items-center">
        <TrustBankLogo className="h-8" />
        <h2 className="text-xl font-semibold">Performance Metrics</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(metrics || {}).map(([method, time]) => (
            <Card key={method}>
              <CardContent className="p-4">
                <h3 className="text-lg font-medium capitalize">{method}</h3>
                <p className="text-2xl font-bold">
                  {formatTime(time as number)}
                </p>
                <p className="text-sm text-gray-500">Avg. Processing Time</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <LineChart
          data={metrics?.chartData || []}
          className="mt-6"
        />
      </CardContent>
    </Card>
  );
}