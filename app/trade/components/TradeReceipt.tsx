import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/app/lib/utils/format";
import { TradeDetails } from "@/app/types/trade";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

export interface TradeReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  trade: TradeDetails;
}

export default function TradeReceipt({ isOpen, onClose, trade }: TradeReceiptProps) {
  const router = useRouter();

  const handleViewTrade = () => {
    router.push(`/trades/${trade.id}`);
    onClose();
  };

  const handleDownload = () => {
    // TODO: Implement receipt download
    console.log('Downloading receipt...');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Trade Receipt</DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Transaction ID</span>
                <span className="font-medium">{trade.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Type</span>
                <span className="font-medium capitalize">{trade.type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Amount</span>
                <span className="font-medium">
                  {formatNumber(trade.amount)} {trade.currency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Rate</span>
                <span className="font-medium">
                  1 {trade.currency} = {formatCurrency(trade.rate)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Service Fee (2%)</span>
                <span className="font-medium">
                  {formatCurrency(trade.fees.platform)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Network Fee (1%)</span>
                <span className="font-medium">
                  {formatCurrency(trade.fees.processing)}
                </span>
              </div>
              <div className="flex justify-between items-center font-medium">
                <span className="text-sm">Total Fee (3%)</span>
                <span>{formatCurrency(trade.fees.total)}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total Amount</span>
                  <span>{formatCurrency(trade.total)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                className="flex-1"
                onClick={handleViewTrade}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Trade
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}