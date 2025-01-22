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
    bankName: "Your Bank Name"
  };

  useEffect(() => {
    if (isOpen) {
      fetchWalletAddress();
    }
  }, [isOpen, currency, selectedNetwork]);

  const fetchWalletAddress = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('currency', currency.toLowerCase());
      if (selectedNetwork) {
        params.append('network', selectedNetwork);
      }

      const response = await fetch(`/api/wallet/address?${params.toString()}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch wallet address');
      }

      const data = await response.json();
      if (!data.data?.address) {
        setError('No deposit address available for this currency. Please try again later or contact support.');
        setAddress(null);
        return;
      }

      setAddress(data.data.address);
      setError(null);
    } catch (err) {
      console.error('Error fetching wallet address:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch wallet address');
      setAddress(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: "Error",
        description: "Failed to copy address",
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
              ? 'Use the bank details below to make your deposit'
              : 'Use the address below to deposit funds to your wallet'}
          </DialogDescription>
        </DialogHeader>

        {currency.toLowerCase() === 'ngn' ? (
          <div className="space-y-4">
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Bank Name</span>
                <span>{bankDetails.bankName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Account Name</span>
                <span>{bankDetails.accountName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Account Number</span>
                <div className="flex items-center gap-2">
                  <span>{bankDetails.accountNumber}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(bankDetails.accountNumber)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {NETWORK_OPTIONS[currency.toLowerCase()] && NETWORK_OPTIONS[currency.toLowerCase()].length > 1 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Network</label>
                <Select
                  value={selectedNetwork || ''}
                  onValueChange={(value) => setSelectedNetwork(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    {NETWORK_OPTIONS[currency.toLowerCase()].map((network) => (
                      <SelectItem key={network} value={network}>
                        {network.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : address ? (
              <>
                <div className="flex justify-center">
                  <QRCode value={address} size={200} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Wallet Address</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-muted px-2 py-1 font-mono text-sm">
                      {address}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(address)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Only send {currency.toUpperCase()} to this address. Sending any other cryptocurrency may result in permanent loss.
                  </AlertDescription>
                </Alert>
              </>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 