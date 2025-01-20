"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WithdrawPreview } from "./WithdrawPreview";
import { useHotkeys } from "react-hotkeys-hook";

interface WithdrawModalProps {
  isOpen: boolean;
  currency: string;
  balance: number;
  onClose: () => void;
}

export default function WithdrawModal({ isOpen, currency, balance, onClose }: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [amountInCrypto, setAmountInCrypto] = useState(0);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rate, setRate] = useState(0);
  const [ngnBalance, setNgnBalance] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [expiryTime, setExpiryTime] = useState(0);
  const [showLargeWithdrawalConfirm, setShowLargeWithdrawalConfirm] = useState(false);

  // Constants for large withdrawal thresholds
  const LARGE_WITHDRAWAL_THRESHOLDS: { [key: string]: number } = {
    btc: 0.1,
    eth: 1,
    usdt: 1000,
    usdc: 1000,
    bnb: 5,
    ngn: 1000000,
  };

  // Handle keyboard shortcuts
  useHotkeys('ctrl+m, cmd+m', () => handleMaxAmount(), { enabled: isOpen });
  useHotkeys('ctrl+enter, cmd+enter', () => handleProceedToWithdraw(), { enabled: isOpen });
  useHotkeys('esc', () => onClose(), { enabled: isOpen });

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
        toast.error("Error", {
          description: "Failed to fetch current rate. Please try again.",
        });
      }
    };
    fetchRate();
  }, [currency]);

  const handleAmountChange = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    setAmount(cleanValue);

    if (currency.toLowerCase() === 'ngn') {
      // For NGN, no conversion needed
      setAmountInCrypto(parseFloat(cleanValue) || 0);
    } else {
      // For crypto, the input is in NGN, convert to crypto
      const ngnAmount = parseFloat(cleanValue) || 0;
      const cryptoAmount = rate > 0 ? ngnAmount / rate : 0;
      setAmountInCrypto(cryptoAmount);
    }
  };

  const handleMaxAmount = () => {
    if (currency.toLowerCase() === 'ngn') {
      const maxAmount = balance.toFixed(2);
      setAmount(maxAmount);
      setAmountInCrypto(balance);
    } else {
      const maxInNGN = (balance * rate).toFixed(2);
      setAmount(maxInNGN);
      setAmountInCrypto(balance);
    }
  };

  const handleProceedToWithdraw = () => {
    if (!amount || (currency.toLowerCase() !== 'ngn' && !address) || !amountInCrypto) return;

    // Check if this is a large withdrawal
    const threshold = LARGE_WITHDRAWAL_THRESHOLDS[currency.toLowerCase()] || 0;
    const isLargeWithdrawal = amountInCrypto > threshold;

    if (isLargeWithdrawal) {
      setShowLargeWithdrawalConfirm(true);
      return;
    }

    // Set expiry time to 14 seconds from now
    setExpiryTime(Date.now() + 14000);
    setShowPreview(true);
  };

  const handleWithdraw = async () => {
    try {
      setIsLoading(true);
      console.log('Withdrawal Request:', {
        currency: currency.toUpperCase(),
        amount: currency.toLowerCase() === 'ngn' ? amount : amountInCrypto.toString(),
        amountInNGN: (parseFloat(amount) * rate).toString(),
        rate,
        balance,
        address,
      });

      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency: currency.toUpperCase(),
          amount: currency.toLowerCase() === 'ngn' ? amount : amountInCrypto.toString(),
          address,
        }),
      });

      const data = await response.json();
      console.log('Withdrawal Response:', {
        status: response.status,
        ok: response.ok,
        data,
      });

      if (!response.ok) {
        let errorMessage = data.error || "Failed to process withdrawal";
        let toastTitle = "Withdrawal Failed";
        
        // Show specific error messages with proper formatting
        if (data.error === 'Insufficient balance') {
          if (data.details) {
            const { available, requested, currency } = data.details;
            console.log('Balance Check:', {
              available,
              requested,
              currency,
              difference: Number(available) - Number(requested)
            });
            errorMessage = `Insufficient balance. Available: ${Number(available).toFixed(8)} ${currency}, Requested: ${Number(requested).toFixed(8)} ${currency}`;
          } else {
            errorMessage = `Insufficient balance. Available: ${balance.toFixed(8)} ${currency.toUpperCase()}, Requested: ${amount} ${currency.toUpperCase()}`;
          }
          toastTitle = "Insufficient Balance";
        } else if (data.error === 'Invalid wallet address') {
          errorMessage = 'Please enter a valid wallet address';
          toastTitle = "Invalid Address";
        } else if (data.error === 'Amount is below minimum withdrawal limit') {
          interface WithdrawalDetails {
            minimum: number;
            currency: string;
          }
          const defaultDetails: WithdrawalDetails = {
            minimum: 0.000001,
            currency: currency.toUpperCase()
          };
          const details: WithdrawalDetails = data.details || defaultDetails;
          errorMessage = `Minimum withdrawal amount is ${details.minimum} ${details.currency}`;
          toastTitle = "Invalid Amount";
        }

        // Show the toast before throwing the error
        toast.error(toastTitle, {
          description: errorMessage,
          duration: 5000,
        });

        throw new Error(errorMessage);
      }

      // Show success toast with transaction ID
      toast.success("Withdrawal Initiated", {
        description: `Your withdrawal of ${amountInCrypto.toFixed(8)} ${currency.toUpperCase()} has been initiated. Transaction ID: ${data.data.transaction_id}`,
      });

      // Add a second toast to inform about transaction tracking
      toast.info("Track Your Transaction", {
        description: "You can view the status of your withdrawal in the Transaction History.",
      });

      onClose();
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error("Withdrawal Failed", {
        description: error instanceof Error ? error.message : "Failed to process withdrawal. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setShowPreview(false);
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
        if (response.status === 400) {
          throw new Error(data.error || "Invalid sell request. Please check your inputs.");
        } else if (response.status === 401) {
          throw new Error("You must be logged in to sell crypto.");
        } else if (response.status === 403) {
          throw new Error("You are not authorized to perform this action.");
        } else if (response.status === 500) {
          throw new Error("Failed to get quote. Please try again later.");
        }
        throw new Error(data.error || "Failed to get quote");
      }

      // Show toast for quote received
      toast.success("Quote Received", {
        description: `Selling ${amountInCrypto} ${currency.toUpperCase()} for ${formatCurrency(data.data.target_amount, "NGN")}`,
      });

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
        if (confirmResponse.status === 400) {
          throw new Error(confirmData.error || "Invalid confirmation request.");
        } else if (confirmResponse.status === 401) {
          throw new Error("Session expired. Please log in again.");
        } else if (confirmResponse.status === 403) {
          throw new Error("You are not authorized to confirm this trade.");
        } else if (confirmResponse.status === 500) {
          throw new Error("Failed to confirm trade. Please try again later.");
        }
        throw new Error(confirmData.error || "Failed to confirm sell order");
      }

      // Show success toast with trade details
      toast.success("Trade Successful", {
        description: `Successfully sold ${amountInCrypto} ${currency.toUpperCase()} for ${formatCurrency(data.data.target_amount, "NGN")}. Trade ID: ${confirmData.data.trade_id}`,
      });

      // Add a second toast to inform about transaction tracking
      toast.info("Track Your Trade", {
        description: "You can view the details of this trade in your Transaction History.",
      });

      onClose();
    } catch (error) {
      console.error('Sell to NGN error:', error);
      toast.error("Trade Failed", {
        description: error instanceof Error ? error.message : "Failed to complete the trade. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showPreview) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Withdrawal</DialogTitle>
            <DialogDescription>
              Please review your withdrawal details carefully before proceeding
            </DialogDescription>
          </DialogHeader>
          <WithdrawPreview
            amount={amountInCrypto.toString()}
            currency={currency}
            address={address}
            onConfirm={handleWithdraw}
            onCancel={() => setShowPreview(false)}
            loading={isLoading}
            expiryTime={expiryTime}
            rate={rate}
            amountInCrypto={amountInCrypto}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {
        setShowLargeWithdrawalConfirm(false);
        onClose();
      }}>
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
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Amount ({currency.toUpperCase()})</label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMaxAmount}
                            className="h-6 text-xs hover:bg-green-50 hover:text-green-600"
                          >
                            Max
                          </Button>
                        </div>
                        <Input
                          type="number"
                          placeholder={`Enter amount in ${currency.toUpperCase()}`}
                          value={amount}
                          onChange={(e) => handleAmountChange(e.target.value)}
                          min="0"
                          step="0.00000001"
                        />
                        {amount && rate && (
                          <div className="text-sm text-muted-foreground">
                            ≈ {formatCurrency(parseFloat(amount) * rate, "NGN")}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Minimum withdrawal: 0.000001 {currency.toUpperCase()}
                          </div>
                          <div>Shortcuts: Cmd/Ctrl + M (Max), Cmd/Ctrl + Enter (Proceed), Esc (Close)</div>
                        </div>
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
                        onClick={handleProceedToWithdraw}
                        disabled={!amount || !address || isLoading || amountInCrypto > balance}
                        className="bg-green-600 hover:bg-green-700 text-white transition-colors"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Proceed to Withdraw'
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
                          'Sell to NGN'
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

      {/* Large Withdrawal Confirmation Dialog */}
      <Dialog open={showLargeWithdrawalConfirm} onOpenChange={setShowLargeWithdrawalConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Large Withdrawal</DialogTitle>
            <DialogDescription>
              You are about to withdraw a large amount. Please confirm the details below:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Amount:</p>
              <p className="text-lg font-bold">{amountInCrypto} {currency.toUpperCase()}</p>
              {currency.toLowerCase() !== 'ngn' && (
                <p className="text-sm text-muted-foreground">
                  ≈ {formatCurrency(parseFloat(amount), 'NGN')}
                </p>
              )}
            </div>
            {currency.toLowerCase() !== 'ngn' && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Destination Address:</p>
                <p className="text-sm font-mono break-all">{address}</p>
              </div>
            )}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please verify all details carefully. This action cannot be undone.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button variant="outline" onClick={() => setShowLargeWithdrawalConfirm(false)}>Cancel</Button>
            <Button onClick={() => {
              setShowLargeWithdrawalConfirm(false);
              setExpiryTime(Date.now() + 14000);
              setShowPreview(true);
            }}>
              Confirm Withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Preview Dialog */}
      <WithdrawPreview
        amount={amountInCrypto.toString()}
        currency={currency}
        address={address}
        onConfirm={handleWithdraw}
        onCancel={() => setShowPreview(false)}
        loading={isLoading}
        expiryTime={expiryTime}
        rate={rate}
        amountInCrypto={amountInCrypto}
      />
    </>
  );
}