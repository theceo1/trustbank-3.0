import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/app/lib/utils/format";
import { TradeDetails } from "@/app/types/trade";
import { Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export interface TradePreviewProps {
  tradeDetails: TradeDetails;
  onConfirm: () => void;
  onCancel: () => void;
  onRefreshQuote: () => void;
  isLoading: boolean;
  isOpen: boolean;
  expiryTime: number;
}

export function TradePreview({
  tradeDetails,
  onConfirm,
  onCancel,
  onRefreshQuote,
  isLoading,
  isOpen,
  expiryTime
}: TradePreviewProps) {
  const [timeLeft, setTimeLeft] = useState(14);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onCancel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onCancel]);

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Trade</DialogTitle>
          <DialogDescription>
            Please review your trade details before confirming.
            The quote will expire in {timeLeft} seconds.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Type</span>
              <span className="font-medium capitalize">{tradeDetails.type}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Amount</span>
              <span className="font-medium">
                {formatNumber(tradeDetails.amount)} {tradeDetails.currency}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Rate</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  1 {tradeDetails.currency} = {formatCurrency(tradeDetails.rate)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={onRefreshQuote}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Service Fee (2%)</span>
              <span className="font-medium">
                {formatCurrency(tradeDetails.fees.platform)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Network Fee (1%)</span>
              <span className="font-medium">
                {formatCurrency(tradeDetails.fees.processing || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center font-medium">
              <span className="text-sm">Total Fee (3%)</span>
              <span>{formatCurrency(tradeDetails.fees.total)}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center font-semibold">
                <span>Total Amount</span>
                <span>{formatCurrency(tradeDetails.total)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirming...
                </span>
              ) : (
                'Confirm Trade'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 