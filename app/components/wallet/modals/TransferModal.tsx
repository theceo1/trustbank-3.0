import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: string;
  balance: number;
}

export default function TransferModal({ isOpen, onClose, currency, balance }: TransferModalProps) {
  const { toast } = useToast();
  const [recipientId, setRecipientId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRecipientId("");
      setAmount("");
      setNote("");
      setIsProcessing(false);
    }
  }, [isOpen]);

  const handleTransfer = async () => {
    if (!amount || !recipientId) {
      toast({
        title: "Missing Information",
        description: "Please enter both recipient ID and amount.",
        variant: "destructive",
      });
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    if (transferAmount > balance) {
      toast({
        title: "Insufficient Balance",
        description: `You can only transfer up to ${formatCurrency(balance, currency)}.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      const response = await fetch("/api/wallet/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId,
          amount: transferAmount,
          currency: currency.toLowerCase(),
          note: note.trim() || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "Failed to process transfer";
        if (data.error === "Recipient not found") {
          errorMessage = "The recipient ID you entered was not found.";
        } else if (data.error === "Cannot transfer to self") {
          errorMessage = "You cannot transfer to your own account.";
        } else if (data.error === "Insufficient balance") {
          errorMessage = "You don't have enough balance for this transfer.";
        }
        throw new Error(errorMessage);
      }

      toast({
        title: "Transfer Successful",
        description: `Successfully transferred ${formatCurrency(transferAmount, currency)} to ${recipientId}`,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: error instanceof Error ? error.message : "Failed to process transfer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer {currency.toUpperCase()}</DialogTitle>
          <DialogDescription>
            Transfer crypto to another trustBank user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Available Balance:</span>
            <div>{formatCurrency(balance, currency)}</div>
          </div>

          <div className="space-y-2">
            <Label>Recipient ID</Label>
            <Input
              placeholder="Enter recipient&apos;s ID"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              disabled={isProcessing}
              data-testid="recipient-id"
            />
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              placeholder={`Enter amount in ${currency.toUpperCase()}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="any"
              disabled={isProcessing}
              data-testid="amount"
            />
            {amount && (
              <div className="text-sm text-muted-foreground">
                ≈ {formatCurrency(parseFloat(amount), currency)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Note (Optional)</Label>
            <Input
              placeholder="Add a note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isProcessing}
              maxLength={100}
              data-testid="note"
            />
          </div>

          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Make sure to verify the recipient&apos;s ID before proceeding with the transfer.
            </AlertDescription>
          </Alert>

          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={handleTransfer}
            disabled={isProcessing || !amount || !recipientId || parseFloat(amount) > balance}
            data-testid="confirm-transfer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Transfer'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 