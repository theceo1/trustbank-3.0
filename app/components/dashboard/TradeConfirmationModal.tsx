import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/app/lib/utils";
import { AlertCircle } from 'lucide-react';

interface TradeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  details: {
    type: 'buy' | 'sell';
    currency: string;
    amount: number;
    rate: number;
    total: number;
    paymentMethod: 'wallet' | 'bank';
    walletBalance?: number;
  };
}

export function TradeConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  details
}: TradeConfirmationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isWalletPayment = details.paymentMethod === 'wallet';
  const hasInsufficientBalance = isWalletPayment && (details.walletBalance || 0) < details.total;

  const handleConfirm = async () => {
    if (hasInsufficientBalance) return;
    
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose(); // Close modal after successful confirmation
    } catch (error) {
      console.error('Trade confirmation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm {details.type.toUpperCase()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p>
            You are about to {details.type} {formatCurrency(details.amount)} worth of {details.currency.toUpperCase()}
          </p>

          {isWalletPayment && (
            <div className={`p-3 rounded-lg ${hasInsufficientBalance ? 'bg-red-50' : 'bg-green-50'}`}>
              <p className="text-sm">
                Wallet Balance: {formatCurrency(details.walletBalance || 0)}
              </p>
              {hasInsufficientBalance && (
                <div className="mt-2 text-sm text-red-600">
                  <AlertCircle className="inline-block w-4 h-4 mr-1" />
                  Insufficient balance. Please top up your wallet or use bank transfer.
                </div>
              )}
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Payment Method: {details.paymentMethod.toUpperCase()}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          {hasInsufficientBalance ? (
            <Button onClick={() => window.location.href = '/wallet/deposit'}>
              Top Up Wallet
            </Button>
          ) : (
            <Button onClick={handleConfirm} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Confirm'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}