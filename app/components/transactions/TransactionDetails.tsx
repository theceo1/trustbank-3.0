"use client";

import { CryptoTransaction, Transaction } from "@/app/types/transactions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { formatCurrency } from "@/app/lib/utils";
import { Separator } from "@/components/ui/separator";

interface TransactionDetailsProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
 
export default function TransactionDetails({ transaction, open, onOpenChange }: TransactionDetailsProps) {
  if (!transaction) return null;
  
  // Helper function to check transaction type
  const isCryptoTransaction = (tx: Transaction): tx is CryptoTransaction => {
    return tx.type === 'buy' || tx.type === 'sell';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Amount (NGN)</div>
            <div>{formatCurrency(transaction.amount, 'NGN')}</div>

            {isCryptoTransaction(transaction) && (
              <>
                <div className="text-muted-foreground">Crypto Amount</div>
                <div>{transaction.crypto_amount} {transaction.crypto_currency}</div>

                <div className="text-muted-foreground">Rate</div>
                <div>{formatCurrency(transaction.rate, 'NGN')}/{transaction.crypto_currency}</div>
              </>
            )}
          </div>

          {transaction.payment_reference && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Payment Reference</div>
                <div className="font-mono">{transaction.payment_reference}</div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}