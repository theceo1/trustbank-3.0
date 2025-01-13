//app/trade/components/TradePreview.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { Separator } from "@/app/components/ui/separator";
import { formatCurrency, formatNumber } from "@/app/lib/utils/format";
import { TradeDetails } from "@/app/types/trade";
import { Loader2, RefreshCw, Shield, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const formatCryptoAmount = (amount: number): string => {
  return formatNumber(amount);
};

export interface TradePreviewProps {
  tradeDetails: TradeDetails;
  onConfirm: () => void;
  onCancel: () => void;
  onRefreshQuote: () => void;
  isLoading: boolean;
  isOpen: boolean;
  expiryTime: number;
}

export default function TradePreview({
  tradeDetails,
  onConfirm,
  onCancel,
  onRefreshQuote,
  isLoading,
  isOpen,
  expiryTime
}: TradePreviewProps) {
  const [timeLeft, setTimeLeft] = useState<number>(14);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const secondsLeft = Math.max(0, Math.ceil((expiryTime - now) / 1000));
      setTimeLeft(secondsLeft);
      
      if (secondsLeft === 0) {
        setIsExpired(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, expiryTime]);

  if (!isOpen) return null;
  
  const fees = {
    service: tradeDetails.amount * 0.01,
    network: 0.0005
  };

  const total = tradeDetails.type === 'buy' 
    ? tradeDetails.amount + fees.service + fees.network
    : tradeDetails.amount - fees.service - fees.network;

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Your Trade</DialogTitle>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-muted-foreground">
              Rate valid for:
            </span>
            <div className="flex items-center gap-2">
              <Progress value={(timeLeft / 14) * 100} className="w-24" />
              <span className="text-sm font-medium">{timeLeft}s</span>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-100 dark:border-green-900">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">You {tradeDetails.type}</span>
              <span className="text-lg font-semibold">
                {formatCryptoAmount(tradeDetails.amount)} {tradeDetails.currency.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Rate</span>
              <span className="text-lg font-semibold text-green-600">
                {formatCurrency(tradeDetails.rate)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Fee Breakdown</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>{formatCurrency(fees.service)}</span>
              </div>
              <div className="flex justify-between">
                <span>Network Fee</span>
                <span>{formatCurrency(fees.network)}</span>
              </div>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Estimated processing time: 5-15 minutes</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="h-12 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading || isExpired}
              className="h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 transition-all duration-300"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing
                </span>
              ) : isExpired ? (
                <span className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Rate Expired
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Proceed to Payment
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}