import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/app/components/ui/card";
import { formatDate, formatCurrency } from "@/app/lib/utils";
import { UnifiedTradeService } from '@/app/lib/services/unifiedTrade';
import { TradeDetails, TradeStatus } from '@/app/types/trade';
import { useToast } from '@/app/hooks/use-toast';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { RefreshCw } from 'lucide-react';

const statusColors: Record<TradeStatus, string> = {
  PENDING: 'text-yellow-600',
  PROCESSING: 'text-yellow-600',
  COMPLETED: 'text-green-600',
  FAILED: 'text-red-600'
} as const;

export function TradeHistory() {
  const [trades, setTrades] = useState<TradeDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTrades = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const userTrades = await UnifiedTradeService.getTradeHistory(user.id);
      setTrades(userTrades);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load trade history';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [user]);

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

  if (error) {
    return (
      <Card className="bg-destructive/10">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-destructive text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTrades}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (trades.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No trades found</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTrades}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTrades}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

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
    </div>
  );
}