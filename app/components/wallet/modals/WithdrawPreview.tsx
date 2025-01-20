"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";

export interface WithdrawPreviewProps {
  amount: string;
  currency: string;
  address: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  expiryTime: number;
  rate?: number;
  amountInCrypto?: number;
}

export function WithdrawPreview({
  amount,
  currency,
  address,
  onConfirm,
  onCancel,
  loading,
  expiryTime,
  rate,
  amountInCrypto
}: WithdrawPreviewProps) {
  const [timeLeft, setTimeLeft] = useState(14);
  const [isExpired, setIsExpired] = useState(false);

  // Hardcoded fees for now - these should come from the API
  const networkFee = 0.001; // Example network fee
  const platformFee = 0.001; // Example platform fee
  const totalFees = networkFee + platformFee;
  const finalAmount = amountInCrypto ? Math.max(0, amountInCrypto - totalFees) : parseFloat(amount);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const secondsLeft = Math.max(0, Math.ceil((expiryTime - now) / 1000));
      setTimeLeft(secondsLeft);
      
      if (secondsLeft === 0) {
        setIsExpired(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTime]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Progress 
          value={(timeLeft / 14) * 100} 
          className="h-2 bg-secondary"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Initiated</span>
          <span>Processing</span>
          <span>Completed</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Confirm Withdrawal</CardTitle>
          <CardDescription>
            Please review your withdrawal details carefully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Amount to Withdraw</Label>
            <div className="font-mono text-lg">
              {currency.toLowerCase() === 'ngn' ? (
                formatCurrency(parseFloat(amount), 'NGN')
              ) : (
                <>
                  {amountInCrypto?.toFixed(8)} {currency.toUpperCase()}
                  <div className="text-sm text-muted-foreground">
                    ≈ {formatCurrency(parseFloat(amount), 'NGN')}
                  </div>
                </>
              )}
            </div>
          </div>

          {currency.toLowerCase() !== 'ngn' && (
            <>
              <div className="space-y-2">
                <Label>Network Fee</Label>
                <div className="font-mono">
                  {networkFee} {currency.toUpperCase()}
                  <div className="text-sm text-muted-foreground">
                    ≈ {formatCurrency(networkFee * (rate || 0), 'NGN')}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Platform Fee</Label>
                <div className="font-mono">
                  {platformFee} {currency.toUpperCase()}
                  <div className="text-sm text-muted-foreground">
                    ≈ {formatCurrency(platformFee * (rate || 0), 'NGN')}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>You Will Receive</Label>
                <div className="font-mono text-lg font-bold">
                  {finalAmount.toFixed(8)} {currency.toUpperCase()}
                  <div className="text-sm text-muted-foreground font-normal">
                    ≈ {formatCurrency(finalAmount * (rate || 0), 'NGN')}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Destination Address</Label>
            <div className="font-mono text-sm break-all">
              {address}
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This transaction cannot be reversed once confirmed. Please verify all details carefully.
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground">
            {!isExpired ? (
              `Quote expires in ${timeLeft} seconds...`
            ) : (
              'Quote expired. Please try again.'
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="hover:bg-green-50 hover:text-green-600 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading || isExpired}
            className="bg-green-600 hover:bg-green-700 text-white transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Withdrawal'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 