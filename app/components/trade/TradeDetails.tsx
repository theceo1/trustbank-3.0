"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";
import { formatCurrency, formatDate } from "@/app/lib/utils";
import { TradeStatus } from "@/app/types/trade";
import { useToast } from "@/app/hooks/use-toast";
import { generatePDF } from "@/app/lib/utils/pdf";

interface TradeDetailsProps {
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

export function TradeDetails({ trade }: TradeDetailsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const receiptData = {
        id: trade.id,
        reference: trade.reference,
        type: trade.type,
        currency: trade.currency,
        amount: trade.amount,
        rate: trade.rate,
        fees: trade.fees,
        status: trade.status,
        date: formatDate(trade.created_at),
      };

      await generatePDF(receiptData);
      toast({
        title: "Success",
        description: "Receipt downloaded successfully",
      });
    } catch (error) {
      console.error("Failed to download receipt:", error);
      toast({
        title: "Error",
        description: "Failed to download receipt",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const statusColors = {
    pending: "text-yellow-600",
    processing: "text-yellow-600",
    completed: "text-green-600",
    failed: "text-red-600",
    cancelled: "text-red-600"
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Trade Details</CardTitle>
          <span className={`font-medium ${statusColors[trade.status]}`}>
            {trade.status}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDate(trade.created_at)}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
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
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
          <Button
            className="flex-1"
            asChild
          >
            <a href={`/trades/${trade.id}/receipt`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Receipt
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 