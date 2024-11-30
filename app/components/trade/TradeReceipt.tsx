import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/app/lib/utils";
import { TradeDetails } from "@/app/types/trade";

interface TradeReceiptProps {
  trade: TradeDetails;
}

export function TradeReceipt({ trade }: TradeReceiptProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Receipt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground">Transaction ID</span>
          <span className="font-medium">{trade.id.slice(0, 8)}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground">Type</span>
          <span className="font-medium capitalize">{trade.type}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground">Currency</span>
          <span className="font-medium">{trade.currency.toUpperCase()}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-medium">{formatCurrency(trade.amount)}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground">Rate</span>
          <span className="font-medium">{formatCurrency(trade.rate)}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground">Payment Method</span>
          <span className="font-medium capitalize">{trade.payment_method}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-muted-foreground">Date</span>
          <span className="font-medium">{formatDate(trade.created_at || '')}</span>
        </div>
      </CardContent>
    </Card>
  );
}