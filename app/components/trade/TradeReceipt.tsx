"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/app/lib/utils";
import { TradeStatus } from "@/app/types/trade";
import QRCode from "react-qr-code";

interface TradeReceiptProps {
  trade: {
    id: string;
    type: string;
    currency: string;
    amount: number;
    rate: number;
    fees: {
      platform: number;
      processing: number;
      total: number;
    };
    status: TradeStatus;
    created_at: string;
    reference: string;
  };
}

export function TradeReceipt({ trade }: TradeReceiptProps) {
  const statusColors = {
    PENDING: "text-yellow-600",
    PROCESSING: "text-yellow-600",
    COMPLETED: "text-green-600",
    FAILED: "text-red-600",
  };

  return (
    <Card className="max-w-2xl mx-auto bg-white print:shadow-none">
      <CardContent className="p-8 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">trustBank</h1>
            <p className="text-sm text-muted-foreground">Trade Receipt</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{formatDate(trade.created_at)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Trade ID</p>
            <p className="font-medium">{trade.id}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Reference</p>
            <p className="font-medium">{trade.reference}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Type</span>
            <span className="font-medium capitalize">{trade.type}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="font-medium">
              {formatCurrency(trade.amount, trade.currency)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Rate</span>
            <span className="font-medium">{formatCurrency(trade.rate)}</span>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Platform Fee (1.6%)</span>
            <span className="font-medium">
              {formatCurrency(trade.fees.platform)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Processing Fee (1.4%)</span>
            <span className="font-medium">
              {formatCurrency(trade.fees.processing)}
            </span>
          </div>
          <div className="flex justify-between items-center font-medium">
            <span>Total Fee (3%)</span>
            <span>{formatCurrency(trade.fees.total)}</span>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center font-medium">
            <span>Total Amount</span>
            <span>{formatCurrency(trade.amount + trade.fees.total)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className={`font-medium ${statusColors[trade.status]}`}>
              {trade.status}
            </p>
          </div>
          <div className="print:hidden">
            <QRCode
              value={trade.reference}
              size={80}
              level="L"
              className="bg-white p-2"
            />
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground pt-6 border-t">
          <p>This is an electronically generated receipt and does not require a signature.</p>
          <p>For any queries, please contact support@trustbank.com</p>
        </div>
      </CardContent>
    </Card>
  );
}