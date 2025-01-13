import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Copy, Check, Loader2 } from "lucide-react";
import { useToast } from "@/app/hooks/use-toast";
import QRCode from "react-qr-code";

interface DepositModalProps {
  isOpen: boolean;
  currency: string;
  onClose: () => void;
}

export default function DepositModal({ isOpen, currency, onClose }: DepositModalProps) {
  const { toast } = useToast();
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Mock bank account details - replace with actual account details from your backend
  const bankDetails = {
    accountName: "trustBank Limited",
    accountNumber: "0123456789",
    bankName: "Providus Bank",
  };

  useEffect(() => {
    const fetchWalletAddress = async () => {
      if (currency.toLowerCase() === 'ngn') {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/wallet/address?currency=${currency.toLowerCase()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch wallet address");
        }

        if (!data.data?.address) {
          throw new Error("No wallet address found");
        }

        setAddress(data.data.address);
      } catch (error) {
        console.error("Error fetching wallet address:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch wallet address");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchWalletAddress();
    }
  }, [currency, isOpen]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: currency.toLowerCase() === 'ngn' 
          ? "Bank account details copied to clipboard"
          : "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit {currency.toUpperCase()}</DialogTitle>
          <DialogDescription>
            {currency.toLowerCase() === 'ngn'
              ? "Transfer from your bank account to fund your NGN wallet."
              : `Send ${currency.toUpperCase()} to your wallet address.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {currency.toLowerCase() === 'ngn' ? (
            // NGN Bank Account Details
            <>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Transfer to our bank account and your NGN wallet will be credited automatically.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Bank Name</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-green-600 hover:text-green-700"
                      onClick={() => handleCopy(bankDetails.bankName)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="text-sm">{bankDetails.bankName}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Account Number</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-green-600 hover:text-green-700"
                      onClick={() => handleCopy(bankDetails.accountNumber)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="text-sm">{bankDetails.accountNumber}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Account Name</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-green-600 hover:text-green-700"
                      onClick={() => handleCopy(bankDetails.accountName)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="text-sm">{bankDetails.accountName}</div>
                </div>
              </div>
            </>
          ) : (
            // Crypto Wallet Address
            <>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Only send {currency.toUpperCase()} to this address. Sending any other cryptocurrency may result in permanent loss.
                </AlertDescription>
              </Alert>

              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : address ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-white p-2 rounded-lg">
                      <QRCode value={address} size={200} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Wallet Address</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-green-600 hover:text-green-700"
                        onClick={() => handleCopy(address)}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="text-sm break-all">{address}</div>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 