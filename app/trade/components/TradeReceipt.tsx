import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TradeDetails } from "@/app/types/trade";
import { TradeUtils } from "@/app/lib/services/tradeUtils";

interface TradeReceiptProps {
  trade: TradeDetails;
}

export function TradeReceipt({ trade }: TradeReceiptProps) {
  const fees = TradeUtils.calculateFees(trade.amount, trade.rate);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Receipt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Type</span>
          <span className="font-medium capitalize">{trade.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-medium">
            {TradeUtils.formatAmount(trade.amount, trade.currency)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Rate</span>
          <span className="font-medium">{TradeUtils.formatAmount(trade.rate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Service Fee</span>
          <span className="font-medium">{TradeUtils.formatAmount(fees.serviceFee)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Network Fee</span>
          <span className="font-medium">{TradeUtils.formatAmount(fees.networkFee)}</span>
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>{TradeUtils.formatAmount(fees.total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}