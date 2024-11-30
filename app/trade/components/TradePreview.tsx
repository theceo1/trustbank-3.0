"use client";

import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TradeDetails } from "@/app/types/trade";
import { formatCurrency } from "@/lib/utils";
import { Shield, Clock, ArrowRight, Loader2 } from "lucide-react";
import { formatCryptoAmount } from '@/app/lib/utils';

interface TradePreviewProps {
  tradeDetails: TradeDetails;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isOpen?: boolean;
}

export function TradePreview({
  tradeDetails,
  onConfirm,
  onCancel,
  isLoading,
  isOpen
}: TradePreviewProps) {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
    >
      <Card className="w-full max-w-md mx-auto bg-white/95 dark:bg-gray-900/95 shadow-2xl">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-bold">Confirm Your Trade</CardTitle>
          <p className="text-sm text-muted-foreground">
            Please review your {tradeDetails.type} order details
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Trade Summary */}
          <div className="space-y-4 p-4 bg-primary/5 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">You {tradeDetails.type}</span>
              <span className="text-lg font-semibold">
                {formatCryptoAmount(tradeDetails.amount)} {tradeDetails.currency.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Rate</span>
              <span className="text-lg font-semibold">
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
              className="h-12"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="h-12 bg-gradient-to-r from-primary to-primary/90"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Confirm
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