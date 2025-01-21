'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/app/lib/utils';
import { CheckCircle2 } from 'lucide-react';
import { TradeDetails } from '@/app/types/trade';

interface TradeReceiptProps {
  trade: TradeDetails;
  onClose: () => void;
}

export default function TradeReceipt({ trade, onClose }: TradeReceiptProps) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            Trade Successful
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Transaction ID</span>
            <span className="font-medium dark:text-white">{trade.id}</span>
          </div>
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
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Time</span>
            <span className="font-medium dark:text-white">
              {new Date(trade.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="w-full bg-primary hover:bg-primary/90">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}