"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDown, ArrowUp, ArrowRightLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/app/lib/utils";

interface WalletActionsProps {
  balance: number;
  currency?: string;
}

export function WalletActions({ balance, currency = "NGN" }: WalletActionsProps) {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleDeposit = async () => {
    setIsProcessing(true);
    try {
      // TODO: Implement deposit logic
      toast({
        title: "Coming Soon!",
        description: "Deposit functionality will be available soon.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process deposit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setShowDepositModal(false);
      setAmount("");
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to withdraw.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) > balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Implement withdrawal logic
      toast({
        title: "Coming Soon!",
        description: "Withdrawal functionality will be available soon.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process withdrawal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setShowWithdrawModal(false);
      setAmount("");
    }
  };

  const handleTransfer = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to transfer.",
        variant: "destructive",
      });
      return;
    }

    if (!recipientAddress) {
      toast({
        title: "Invalid Recipient",
        description: "Please enter a valid recipient address.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) > balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this transfer.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Implement transfer logic
      toast({
        title: "Coming Soon!",
        description: "Transfer functionality will be available soon.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process transfer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setShowTransferModal(false);
      setAmount("");
      setRecipientAddress("");
    }
  };

  return (
    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
      <Button
        variant="outline"
        className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
        onClick={() => setShowDepositModal(true)}
      >
        <ArrowDown className="mr-2 h-4 w-4" />
        Deposit
      </Button>
      
      <Button
        variant="outline"
        className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
        onClick={() => setShowWithdrawModal(true)}
      >
        <ArrowUp className="mr-2 h-4 w-4" />
        Withdraw
      </Button>
      
      <Button
        variant="outline"
        className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
        onClick={() => setShowTransferModal(true)}
      >
        <ArrowRightLeft className="mr-2 h-4 w-4" />
        Transfer
      </Button>

      {/* Deposit Modal */}
      <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit {currency}</DialogTitle>
            <DialogDescription>
              Add funds to your wallet using your preferred payment method.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleDeposit}
              disabled={isProcessing || !amount}
            >
              {isProcessing ? "Processing..." : "Continue to Deposit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw {currency}</DialogTitle>
            <DialogDescription>
              Available Balance: {formatCurrency(balance, currency)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleWithdraw}
              disabled={isProcessing || !amount || parseFloat(amount) > balance}
            >
              {isProcessing ? "Processing..." : "Continue to Withdraw"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Modal */}
      <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer {currency}</DialogTitle>
            <DialogDescription>
              Available Balance: {formatCurrency(balance, currency)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Recipient Address</Label>
              <Input
                placeholder="Enter recipient's wallet address"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleTransfer}
              disabled={isProcessing || !amount || !recipientAddress || parseFloat(amount) > balance}
            >
              {isProcessing ? "Processing..." : "Continue to Transfer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 