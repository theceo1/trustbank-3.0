"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WithdrawPreview } from "./WithdrawPreview";

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

  const handleProceedToWithdraw = () => {
    if (!amount || (currency.toLowerCase() !== 'ngn' && !address) || !amountInCrypto) return;

    // Set expiry time to 14 seconds from now
    setExpiryTime(Date.now() + 14000);
    setShowPreview(true);
  };

  const handleWithdraw = async () => {
    try {
      setIsLoading(true);
      console.log('Withdrawal Request:', {
        currency: currency.toUpperCase(),
        amount: amount,
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
          amount: amount,
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

  // ... rest of the component code remains the same ...
} 