import { useEffect } from 'react';
import { useTrade } from '@/app/contexts/TradeContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { TradeUtils } from '@/app/lib/services/tradeUtils';

export function TradeStatusCheck() {
  const { currentTrade, checkTradeStatus } = useTrade();

  useEffect(() => {
    if (currentTrade?.id && ['pending', 'processing'].includes(currentTrade.status)) {
      const interval = setInterval(() => {
        checkTradeStatus(currentTrade.id);
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [currentTrade, checkTradeStatus]);

  if (!currentTrade) return null;

  const fees = TradeUtils.calculateFees(currentTrade.amount, currentTrade.rate);

  return (
    <Alert>
      <AlertTitle>Trade Status: {currentTrade.status}</AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-2">
          <Progress value={currentTrade.status === 'completed' ? 100 : 50} />
          <p className="text-sm text-muted-foreground">
            {currentTrade.type === 'buy' ? 'Buying' : 'Selling'}{' '}
            {TradeUtils.formatAmount(currentTrade.amount, currentTrade.currency)} at{' '}
            {TradeUtils.formatAmount(currentTrade.rate)}
          </p>
          <p className="text-sm font-medium">
            Total: {TradeUtils.formatAmount(fees.total)}
          </p>
          <p className="text-xs text-muted-foreground">
            Estimated delivery: {TradeUtils.getEstimatedDeliveryTime(currentTrade.payment_method)}
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}