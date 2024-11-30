import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TradeDetails } from "@/app/types/trade";
import { TradeUtils } from "@/app/lib/services/tradeUtils";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface TradeHistoryTableProps {
  trades: TradeDetails[];
}

export function TradeHistoryTable({ trades }: TradeHistoryTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'processing':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Fees</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {trades.map((trade) => {
          const fees = TradeUtils.calculateFees(trade.amount, trade.rate);
          const totalFees = fees.serviceFee + fees.networkFee;
          return (
            <TableRow key={trade.id}>
              <TableCell>
                {format(new Date(trade.created_at), 'MMM d, yyyy HH:mm')}
              </TableCell>
              <TableCell className="capitalize">{trade.type}</TableCell>
              <TableCell>
                {TradeUtils.formatAmount(trade.amount, trade.currency)}
              </TableCell>
              <TableCell>{TradeUtils.formatAmount(fees.total)}</TableCell>
              <TableCell>{TradeUtils.formatAmount(totalFees)}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(trade.status)}>
                  {trade.status}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}