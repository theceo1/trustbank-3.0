import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentMethodType } from "@/app/types/payment";
import { formatCurrency } from "@/app/lib/utils";

interface TradeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  tradeDetails: {
    type: 'buy' | 'sell';
    currency: string;
    amount: number;
    rate: number;
    total: number;
    paymentMethod: PaymentMethodType;
    fees: {
      service: number;
      network: number;
    };
  };
}

export function TradeDetailsModal({ isOpen, onClose, onProceed, tradeDetails }: TradeDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trade Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <span>Type:</span>
            <span className="text-right capitalize">{tradeDetails.type}</span>
            <span>Currency:</span>
            <span className="text-right">{tradeDetails.currency.toUpperCase()}</span>
            <span>Amount:</span>
            <span className="text-right">{formatCurrency(tradeDetails.amount)}</span>
            <span>Rate:</span>
            <span className="text-right">{formatCurrency(tradeDetails.rate)}</span>
            <span>Service Fee:</span>
            <span className="text-right">{formatCurrency(tradeDetails.fees.service)}</span>
            <span>Network Fee:</span>
            <span className="text-right">{formatCurrency(tradeDetails.fees.network)}</span>
            <span className="font-bold">Total:</span>
            <span className="text-right font-bold">{formatCurrency(tradeDetails.total)}</span>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button onClick={onClose}>Cancel</button>
            <button onClick={onProceed}>Proceed</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}