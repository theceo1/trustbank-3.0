//app/components/trade/TradePreview.tsx
"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Shield, Clock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { formatCurrency, formatCryptoAmount } from "@/app/lib/utils";
import type { TradeQuotation } from "@/app/types/trade";

interface TradePreviewProps {
  quotation: TradeQuotation;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  expiryTime: number;
}

export function TradePreview({
  quotation,
  onConfirm,
  onCancel,
  isLoading,
  expiryTime
}: TradePreviewProps) {
  const [timeLeft, setTimeLeft] = useState<number>(14);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
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
  }, [expiryTime]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <Card className="w-full max-w-md mx-auto bg-white/95 dark:bg-gray-900/95 shadow-2xl border-0">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-bold">Confirm Your Trade</CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Rate valid for:</p>
            <div className="flex items-center gap-2">
              <Progress value={(timeLeft / 14) * 100} className="w-24" />
              <span className="text-sm font-medium">{timeLeft}s</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-100 dark:border-green-900">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-lg font-semibold">
                {formatCryptoAmount(quotation.amount)} {quotation.fromCurrency}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Rate</span>
              <span className="text-lg font-semibold text-green-600">
                {formatCurrency(quotation.rate)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">You&apos;ll receive</span>
              <span className="text-lg font-semibold">
                {formatCurrency(quotation.estimatedAmount)}
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
                <span>{formatCurrency(quotation.fees.platform)}</span>
              </div>
              <div className="flex justify-between">
                <span>Network Fee</span>
                <span>{formatCurrency(quotation.fees.processing)}</span>
              </div>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatCurrency(quotation.total)}</span>
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
              className="h-12"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading || isExpired}
              className="h-12"
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
                  Confirm Trade
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 