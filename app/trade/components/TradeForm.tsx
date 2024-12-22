// app/trade/components/TradeForm.tsx
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTrade } from '@/app/hooks/use-trade';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Wallet, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TradeType, TradeFormProps } from '@/app/types/trade';

const SUPPORTED_CURRENCIES = [
  { value: 'btc', label: 'Bitcoin (BTC)' },
  { value: 'eth', label: 'Ethereum (ETH)' },
  { value: 'usdt', label: 'Tether (USDT)' }
];

const TRADE_ACTIONS: { value: TradeType; label: string; icon: any }[] = [
  { value: 'buy', label: 'Buy', icon: ArrowDownToLine },
  { value: 'sell', label: 'Sell', icon: ArrowUpFromLine },
  { value: 'send', label: 'Send', icon: Send },
  { value: 'receive', label: 'Receive', icon: Wallet }
];

export function TradeForm({ walletBalance = {} }: TradeFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { amount, setAmount, cryptoCurrency, setCryptoCurrency, tradeType, setTradeType, 
          isLoading, rate, fetchRate, createTrade } = useTrade();
  const [countdown, setCountdown] = useState<number>(0);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [bankDetails, setBankDetails] = useState({ 
    accountNumber: '', 
    bankName: '' 
  });

  const handleProceedToTrade = async () => {
    if (!amount || !cryptoCurrency) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // Additional validation for send/receive
    if (tradeType === 'send' && !recipientAddress) {
      toast({
        title: "Invalid Input",
        description: "Please enter recipient address",
        variant: "destructive"
      });
      return;
    }

    try {
      if (tradeType === 'buy' || tradeType === 'sell') {
        await fetchRate();
        setCountdown(15);
        
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        await createTrade();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Transaction failed",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2 mb-6">
        {TRADE_ACTIONS.map(({ value, label, icon: Icon }) => (
          <Button 
            key={value}
            variant={tradeType === value ? 'default' : 'outline'}
            onClick={() => setTradeType(value)}
            className={`flex flex-col gap-1 h-auto py-2 ${
              tradeType === value ? 'bg-green-600 hover:bg-green-300' : ''
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      {/* Show wallet balance only if available */}
      {walletBalance && (
        <div className="text-sm text-muted-foreground">
          Balance: {(walletBalance[cryptoCurrency] || 0).toFixed(8)} {cryptoCurrency.toUpperCase()}
        </div>
      )}

      {/* Currency and Amount fields */}
      <div className="space-y-2">
        <Label>Currency</Label>
        <Select value={cryptoCurrency} onValueChange={setCryptoCurrency}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {SUPPORTED_CURRENCIES.map(currency => (
              <SelectItem key={currency.value} value={currency.value}>
                {currency.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>
          {tradeType === 'buy' || tradeType === 'sell' ? 'Amount (NGN)' : `Amount (${cryptoCurrency.toUpperCase()})`}
        </Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Enter amount in ${tradeType === 'buy' || tradeType === 'sell' ? 'Naira' : cryptoCurrency.toUpperCase()}`}
          min="0"
          step={tradeType === 'buy' || tradeType === 'sell' ? '1' : '0.00000001'}
        />
      </div>

      {/* Additional fields based on trade type */}
      {tradeType === 'send' && (
        <div className="space-y-2">
          <Label>Recipient Address</Label>
          <Input
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder={`Enter ${cryptoCurrency.toUpperCase()} address`}
          />
        </div>
      )}

      {/* Rate display for buy/sell */}
      {rate && countdown > 0 && (tradeType === 'buy' || tradeType === 'sell') && (
        <div className="text-sm text-muted-foreground space-y-1 bg-muted p-3 rounded-lg">
          <p>Exchange Rate: ₦{rate.rate}</p>
          <p>
            You will {tradeType === 'buy' ? 'receive' : 'send'}: {rate.total} {cryptoCurrency.toUpperCase()}
          </p>
          <p>Transaction Fee: ₦{rate.fees.total}</p>
          <p className="text-xs text-right">Rate expires in {countdown}s</p>
        </div>
      )}

      <Button
        onClick={countdown > 0 ? createTrade : handleProceedToTrade}
        disabled={isLoading || !amount}
        className="w-full"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing
          </span>
        ) : countdown > 0 ? (
          "Confirm Trade"
        ) : (
          `${tradeType === 'buy' || tradeType === 'sell' ? 'Get Quote' : 'Proceed'}`
        )}
      </Button>
    </div>
  );
}