//app/trade/components/TradePreview.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/app/lib/utils";
import { TradeDetails } from '@/app/types/trade';

interface TradePreviewProps {
  trade: TradeDetails;
  onConfirm: () => void;
  onClose: () => void;
}

export default function TradePreview({ trade, onConfirm, onClose }: TradePreviewProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold dark:text-white">
            Confirm {trade.type === 'buy' ? 'Purchase' : 'Sale'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
            <span className={`font-medium ${trade.type === 'buy' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trade.type === 'buy' ? 'Buy' : 'Sell'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Pair</span>
            <span className="font-medium dark:text-white">{trade.pair}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Amount</span>
            <span className="font-medium dark:text-white">{trade.amount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Price</span>
            <span className="font-medium dark:text-white">{formatCurrency(trade.price, 'ngn')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
            <span className="font-medium dark:text-white">{formatCurrency(trade.total, 'ngn')}</span>
          </div>
        </div>
        <DialogFooter className="flex space-x-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="flex-1 bg-primary hover:bg-primary/90">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}