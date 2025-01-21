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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DepositModalProps {
  isOpen: boolean;
  currency: string;
  onClose: () => void;
}

type NetworkOptions = {
  [key: string]: string[];
};

const NETWORK_OPTIONS: NetworkOptions = {
  usdt: ['trc20', 'erc20', 'bep20'],
  btc: ['bitcoin'],
  eth: ['ethereum'],
  // Add more networks as needed
};

export default function DepositModal({ isOpen, currency, onClose }: DepositModalProps) {
  const { toast } = useToast();
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);

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

      const currencyKey = currency.toLowerCase();
      const networks = NETWORK_OPTIONS[currencyKey];

      if (networks && !selectedNetwork) {
        setSelectedNetwork(networks[0]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/wallet/deposit-address', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            currency: currencyKey,
            network: selectedNetwork
          })
        });

        const data = await response.json();
        console.log('Deposit address response:', data); // Debug log

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
  }, [currency, isOpen, selectedNetwork]);

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

  const handleCopyAll = async () => {
    if (currency.toLowerCase() === 'ngn') {
      const allDetails = `Bank Name: ${bankDetails.bankName}\nAccount Number: ${bankDetails.accountNumber}\nAccount Name: ${bankDetails.accountName}`;
      await handleCopy(allDetails);
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
                      className="h-8 px-2 text-[#00A651] hover:text-[#00A651]/80"
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
                      className="h-8 px-2 text-[#00A651] hover:text-[#00A651]/80"
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
                      className="h-8 px-2 text-[#00A651] hover:text-[#00A651]/80"
                      onClick={() => handleCopy(bankDetails.accountName)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="text-sm">{bankDetails.accountName}</div>
                </div>

                <Button
                  variant="outline"
                  className="w-full hover:bg-[#00A651] hover:text-white dark:hover:bg-[#00A651]/80 dark:hover:text-white"
                  onClick={handleCopyAll}
                >
                  Copy All Details
                </Button>
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

              {NETWORK_OPTIONS[currency.toLowerCase()] && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Network</label>
                  <Select
                    value={selectedNetwork || ''}
                    onValueChange={(value: string) => setSelectedNetwork(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      {NETWORK_OPTIONS[currency.toLowerCase()].map((network: string) => (
                        <SelectItem key={network} value={network}>
                          {network.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-[#00A651]" />
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
                        className="h-8 px-2 text-[#00A651] hover:text-[#00A651]/80"
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