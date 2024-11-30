import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatCurrency } from "@/app/lib/utils";
import { UnifiedTradeService } from '@/app/lib/services/unifiedTrade';
import { TradeDetails, TradeStatus } from '@/app/types/trade';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const statusColors: Record<TradeStatus, string> = {
  PENDING: 'text-yellow-500',
  PROCESSING: 'text-yellow-500',
  COMPLETED: 'text-green-500',
  FAILED: 'text-red-500'
} as const;

export function TradeHistory() {
  const [trades, setTrades] = useState<TradeDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) return;
      
      try {
        const userTrades = await UnifiedTradeService.getTradeHistory(user.id);
        setTrades(userTrades);
      } catch (error) {
        toast({
          id: "trade-history-error",
          title: 'Error',
          description: 'Failed to load trade history',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [user, toast]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="h-24" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trades.map((trade) => (
        <Card key={trade.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {trade.type.toUpperCase()} {trade.currency.toUpperCase()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(trade.created_at || '')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(trade.amount)}</p>
                <p className={`text-sm ${statusColors[trade.status as keyof typeof statusColors]}`}>
                  {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {trades.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No trades found
          </CardContent>
        </Card>
      )}
    </div>
  );
}