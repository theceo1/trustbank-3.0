import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/app/lib/utils";
import { Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PaymentMethodType } from "@/app/types/payment";

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
  isLoading: boolean;
}

export function TradeDetailsModal({
  isOpen,
  onClose,
  onProceed,
  tradeDetails,
  isLoading
}: TradeDetailsModalProps) {
  const totalWithFees = tradeDetails.total + tradeDetails.fees.service + tradeDetails.fees.network;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Your Trade</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Rate is locked for 30 seconds. Complete your trade before it expires.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-sm text-muted-foreground">Type</div>
            <div className="text-sm font-medium capitalize">{tradeDetails.type}</div>
            
            <div className="text-sm text-muted-foreground">Currency</div>
            <div className="text-sm font-medium">{tradeDetails.currency.toUpperCase()}</div>
            
            <div className="text-sm text-muted-foreground">Amount</div>
            <div className="text-sm font-medium">{formatCurrency(tradeDetails.amount)}</div>
            
            <div className="text-sm text-muted-foreground">Rate</div>
            <div className="text-sm font-medium">{formatCurrency(tradeDetails.rate)}</div>
            
            <div className="text-sm text-muted-foreground">Service Fee</div>
            <div className="text-sm font-medium">{formatCurrency(tradeDetails.fees.service)}</div>
            
            <div className="text-sm text-muted-foreground">Network Fee</div>
            <div className="text-sm font-medium">{formatCurrency(tradeDetails.fees.network)}</div>
            
            <div className="text-sm text-muted-foreground font-medium">Total</div>
            <div className="text-sm font-medium">{formatCurrency(totalWithFees)}</div>
            
            <div className="text-sm text-muted-foreground">Payment Method</div>
            <div className="text-sm font-medium capitalize">{tradeDetails.paymentMethod}</div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={onProceed} 
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Confirm Trade'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}