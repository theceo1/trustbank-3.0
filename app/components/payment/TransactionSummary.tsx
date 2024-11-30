import { TradeDetails } from '@/app/types/trade';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface TransactionSummaryProps {
  trade: TradeDetails;
  isLoading?: boolean;
}

export function TransactionSummary({ trade, isLoading }: TransactionSummaryProps) {
  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-medium">Transaction Summary</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Amount</span>
          <span>{formatCurrency(trade.amount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Payment Method</span>
          <span className="capitalize">{trade.payment_method}</span>
        </div>
        <div className="flex justify-between">
          <span>Reference</span>
          <span className="text-sm font-mono">{trade.reference}</span>
        </div>
      </div>
    </div>
  );
}