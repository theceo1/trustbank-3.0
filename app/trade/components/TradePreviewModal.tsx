import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { TradeDetails } from "@/app/types/trade";
import { formatCryptoAmount } from "@/app/lib/utils/format";

interface TradePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  trade: Omit<TradeDetails, 'id' | 'status' | 'createdAt' | 'updatedAt'>;
}

export function TradePreviewModal({ isOpen, onClose, onConfirm, trade }: TradePreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Trade Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Type</div>
            <div className="font-medium capitalize">{trade.type}</div>
            
            <div className="text-muted-foreground">Amount</div>
            <div className="font-medium">
              {formatCryptoAmount(trade.amount)} {trade.currency.toUpperCase()}
            </div>
            
            <div className="text-muted-foreground">Rate</div>
            <div className="font-medium">{formatCurrency(trade.rate)}</div>
            
            <div className="text-muted-foreground">Service Fee</div>
            <div className="font-medium">{formatCurrency(trade.fees.quidax)}</div>
            
            <div className="text-muted-foreground">Network Fee</div>
            <div className="font-medium">{formatCurrency(trade.fees.platform)}</div>
            
            <div className="text-muted-foreground font-medium">Total</div>
            <div className="font-medium">{formatCurrency(trade.total)}</div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={onConfirm}>Confirm Trade</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}