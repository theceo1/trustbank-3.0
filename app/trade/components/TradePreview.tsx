//app/trade/components/TradePreview.tsx
 
"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TradeDetails } from "@/app/types/trade";
import { formatCurrency } from "@/lib/utils";
import { Shield, Clock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { formatCryptoAmount } from '@/app/lib/utils';
import { Progress } from "@/components/ui/progress";

interface TradePreviewProps {
  tradeDetails: TradeDetails;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isOpen?: boolean;
  expiryTime: number;
}

export function TradePreview({
  tradeDetails,
  onConfirm,
  onCancel,
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
            <p className="text-sm text-muted-foreground">
              Rate valid for:
            </p>
            <div className="flex items-center gap-2">
              <Progress value={(timeLeft / 14) * 100} className="w-24" />
              <span className="text-sm font-medium">{timeLeft}s</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Trade Summary */}
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

          {/* Fees Breakdown */}
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

          {/* Estimated Time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Estimated processing time: 5-15 minutes</span>
          </div>

          {/* Action Buttons */}
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
        </CardContent>
      </Card>
    </motion.div>
  );
}