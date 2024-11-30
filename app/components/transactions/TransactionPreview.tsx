"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/app/lib/utils";
import { Transaction } from "@/app/types/transactions";

interface TransactionPreviewProps {
  type: 'buy' | 'sell';
  amount: number;
  cryptoAmount: number;
  cryptoCurrency: string;
  rate: number;
  fees: {
    network: number;
    service: number;
  };
}

export function TransactionPreview({
  type,
  amount,
  cryptoAmount,
  cryptoCurrency,
  rate,
  fees
}: TransactionPreviewProps) {
  const totalFees = fees.network + fees.service;
  const finalAmount = type === 'buy' ? amount + totalFees : amount - totalFees;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium capitalize">{type} {cryptoCurrency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-medium">{formatCurrency(amount, 'NGN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rate</span>
            <span className="font-medium">{formatCurrency(rate, 'NGN')}/{cryptoCurrency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Crypto Amount</span>
            <span className="font-medium">{cryptoAmount} {cryptoCurrency}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Network Fee</span>
            <span>{formatCurrency(fees.network, 'NGN')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Service Fee</span>
            <span>{formatCurrency(fees.service, 'NGN')}</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between font-medium">
          <span>Total {type === 'buy' ? 'Payment' : 'Receivable'}</span>
          <span>{formatCurrency(finalAmount, 'NGN')}</span>
        </div>
      </CardContent>
    </Card>
  );
}