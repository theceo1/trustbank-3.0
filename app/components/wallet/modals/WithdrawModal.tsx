import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/app/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

interface WithdrawModalProps {
  isOpen: boolean;
  currency: string;
  balance: number;
  onClose: () => void;
}

export default function WithdrawModal({ isOpen, currency, balance, onClose }: WithdrawModalProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [amountInCrypto, setAmountInCrypto] = useState(0);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rate, setRate] = useState(0);
  const [ngnBalance, setNgnBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchRate = async () => {
      if (currency.toLowerCase() === 'ngn') return;
      
      try {
        const market = `${currency.toLowerCase()}ngn`;
        const response = await fetch(`/api/market/rates?market=${market}`);
        if (!response.ok) throw new Error('Failed to fetch rate');
        const data = await response.json();
        if (data.status !== 'success' || !data.data?.rate) {
          throw new Error('Invalid rate data received');
        }
        setRate(parseFloat(data.data.rate));
      } catch (error) {
        console.error('Error fetching rate:', error);
        toast({
          title: "Error",
          description: "Failed to fetch current rate. Please try again.",
          variant: "destructive",
        });
      }
    };
    fetchRate();
  }, [currency, toast]);

  const handleAmountChange = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    setAmount(cleanValue);

    if (currency.toLowerCase() === 'ngn') {
      // For NGN, no conversion needed
      setAmountInCrypto(parseFloat(cleanValue) || 0);
    } else {
      // For crypto, convert NGN to crypto amount
      const ngnAmount = parseFloat(cleanValue) || 0;
      const cryptoAmount = rate > 0 ? ngnAmount / rate : 0;
      setAmountInCrypto(cryptoAmount);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || (currency.toLowerCase() !== 'ngn' && !address) || !amountInCrypto) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency,
          amount: currency.toLowerCase() === 'ngn' ? amount : amountInCrypto,
          address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process withdrawal");
      }

      toast({
        title: "Success",
        description: "Withdrawal initiated successfully",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process withdrawal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSellToNGN = async () => {
    if (!amount || !amountInCrypto) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/trades/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "sell",
          currency: currency.toLowerCase(),
          amount: amountInCrypto,
          target_currency: "ngn"
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.data?.id) {
        throw new Error(data.error || "Failed to get quote");
      }

      // Confirm the sell order
      const confirmResponse = await fetch("/api/trades/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote_id: data.data.id
        }),
      });

      const confirmData = await confirmResponse.json();

      if (!confirmResponse.ok) {
        throw new Error(confirmData.error || "Failed to confirm sell order");
      }

      toast({
        title: "Success",
        description: `Successfully sold ${amountInCrypto} ${currency.toUpperCase()} to NGN`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sell to NGN",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Withdraw {currency.toUpperCase()}</DialogTitle>
          <DialogDescription>
            {currency.toLowerCase() === 'ngn' ? (
              "NGN withdrawal feature coming soon."
            ) : (
              "Enter the amount in NGN you want to withdraw. The equivalent amount in cryptocurrency will be calculated automatically."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Available Balance</Label>
            <div className="text-lg font-semibold">
              {currency.toLowerCase() === 'ngn' ? 
                `₦${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` :
                `${formatCurrency(balance, currency)} ${currency.toUpperCase()}`
              }
            </div>
          </div>

          {currency.toLowerCase() !== 'ngn' ? (
            <>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You can withdraw to an external wallet or sell to NGN. To transfer to another trustBank user, please use the Transfer option.
                </AlertDescription>
              </Alert>

              <Tabs defaultValue="external" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-background">
                  <TabsTrigger 
                    value="external"
                    className="data-[state=active]:bg-green-600 data-[state=active]:text-white hover:text-green-600 transition-colors"
                  >
                    External Wallet
                  </TabsTrigger>
                  <TabsTrigger 
                    value="sell"
                    className="data-[state=active]:bg-green-600 data-[state=active]:text-white hover:text-green-600 transition-colors"
                  >
                    Sell to NGN
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="external" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Available Balance:</span>
                      <div className="text-right">
                        <div>{formatCurrency(balance)} {currency.toUpperCase()}</div>
                        {ngnBalance !== null && (
                          <div className="text-muted-foreground">≈ {formatCurrency(ngnBalance, "NGN")}</div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount ({currency.toUpperCase()})</label>
                      <Input
                        type="number"
                        placeholder={`Enter amount in ${currency.toUpperCase()}`}
                        value={amount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        min="0"
                        step="any"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">External Wallet Address</label>
                      <Input
                        placeholder={`Enter ${currency.toUpperCase()} wallet address`}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Make sure to enter the correct {currency.toUpperCase()} wallet address
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="hover:bg-green-50 hover:text-green-600 transition-colors"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleWithdraw}
                      disabled={!amount || !address || isLoading || amountInCrypto > balance}
                      className="bg-green-600 hover:bg-green-700 text-white transition-colors"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Withdraw ${currency.toUpperCase()}`
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="sell" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Available Balance:</span>
                      <div className="text-right">
                        <div>{formatCurrency(balance)} {currency.toUpperCase()}</div>
                        {ngnBalance !== null && (
                          <div className="text-muted-foreground">≈ {formatCurrency(ngnBalance, "NGN")}</div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount (NGN)</label>
                      <Input
                        type="number"
                        placeholder="Enter amount in NGN"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="0"
                        step="1"
                      />
                      {amountInCrypto && rate && (
                        <div className="text-sm text-muted-foreground">
                          ≈ {amountInCrypto} {currency.toUpperCase()} @ {formatCurrency(rate, "NGN")}/{currency.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="hover:bg-green-50 hover:text-green-600 transition-colors"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSellToNGN}
                      disabled={!amount || isLoading || amountInCrypto > balance}
                      className="bg-green-600 hover:bg-green-700 text-white transition-colors"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Sell to NGN`
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            // NGN Withdrawal Coming Soon
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <Info className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  NGN withdrawal feature is coming soon! We're working hard to bring you seamless bank withdrawals.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="hover:bg-green-50 hover:text-green-600 transition-colors"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 