import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TradeAnalytics } from '@/app/lib/services/tradeAnalytics';
import { TradeUtils } from '@/app/lib/services/tradeUtils';
import { TradeDetails } from '@/app/types/trade';

interface TradeMetricsProps {
  trades: TradeDetails[];
}

export function TradeMetrics({ trades }: TradeMetricsProps) {
  const totalVolume = TradeAnalytics.calculateTotalVolume(trades);
  const successRate = TradeAnalytics.getSuccessRate(trades);
  const averageSize = TradeAnalytics.getAverageTradeSize(trades);
  const tradesByType = TradeAnalytics.getTradesByType(trades);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{TradeUtils.formatAmount(totalVolume)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{successRate.toFixed(1)}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Average Trade</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{TradeUtils.formatAmount(averageSize)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trade Split</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Buy: {tradesByType.buy}</p>
          <p className="text-sm">Sell: {tradesByType.sell}</p>
        </CardContent>
      </Card>
    </div>
  );
}