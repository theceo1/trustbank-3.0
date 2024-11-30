import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLoadingState } from '@/app/hooks/useLoadingState';
import { TransactionSummary } from './TransactionSummary';
import { PaymentConfirmationProps } from '@/app/types/payment';

export function PaymentConfirmationDialog({
  trade,
  onConfirm,
  onCancel
}: PaymentConfirmationProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { isLoading, error, withLoading } = useLoadingState();

  const handleConfirm = async () => {
    try {
      await withLoading(async () => {
        await onConfirm();
        setIsOpen(false);
      });
    } catch (err) {
      // Error handling is managed by useLoadingState
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Confirm Payment</h3>
            <p className="text-sm text-gray-500">
              Please review your transaction details
            </p>
          </div>

          <TransactionSummary trade={trade} />

          {error && (
            <div className="text-sm text-red-600 text-center">
              {error.message}
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Processing...' : 'Confirm Payment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}