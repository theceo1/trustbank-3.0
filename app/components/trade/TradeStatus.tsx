import { useEffect, useState } from "react";
import { TradeStatus as TStatus } from "@/app/types/trade";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/app/components/ui/spinner";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UnifiedTradeService } from "@/app/lib/services/unifiedTrade";

interface TradeStatusProps {
  tradeId: string;
  onStatusChange?: (status: TStatus) => void;
}

export function TradeStatus({ tradeId, onStatusChange }: TradeStatusProps) {
  const [status, setStatus] = useState<TStatus>(TStatus.PENDING);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { status: newStatus } = await UnifiedTradeService.getTradeStatus(tradeId);
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      } catch (error) {
        toast({
          id: "trade-status-error",
          title: "Error",
          description: "Failed to fetch trade status",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [tradeId, onStatusChange, toast]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <span className="capitalize">{status}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusIcon(status: TStatus) {
  switch (status) {
    case TStatus.COMPLETED:
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    case TStatus.FAILED:
      return <XCircle className="h-6 w-6 text-red-500" />;
    default:
      return <Clock className="h-6 w-6 text-yellow-500" />;
  }
}