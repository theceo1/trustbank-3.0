//app/components/trade/TradeForm.tsx
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TradeType, TradeDetails, TradeStatus } from '@/app/types/trade';
import { PaymentMethodType } from '@/app/types/payment';
import { formatCurrency } from '@/app/lib/utils';
import { ArrowRight } from 'lucide-react';

interface TradeFormProps {
  type: TradeType;
  balance: number;
  isLoading?: boolean;
  onSubmit: (trade: TradeDetails) => Promise<void>;
}

const PAYMENT_METHODS: Record<TradeType, PaymentMethodType[]> = {
  buy: ['wallet', 'card', 'bank_transfer'],
  sell: ['bank_transfer'],
  swap: ['wallet'],
  send: ['wallet'],
  receive: ['wallet']
};

const SUPPORTED_CURRENCIES = [
  { value: 'btc', label: 'Bitcoin (BTC)' },
  { value: 'eth', label: 'Ethereum (ETH)' },
  { value: 'usdt', label: 'Tether (USDT)' },
  { value: 'usdc', label: 'USD Coin (USDC)' }
];

export function TradeForm({ type, balance, onSubmit, isLoading }: TradeFormProps) {
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [formData, setFormData] = useState({
    amount: "",
    currency: SUPPORTED_CURRENCIES[0].value,
    paymentMethod: PAYMENT_METHODS[type][0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'input') {
      setStep('review');
      return;
    }
  
    if (!formData.amount || isLoading) return;
  
    try {
      await onSubmit({
        amount: Number(formData.amount) || 0,
        type,
        payment_method: formData.paymentMethod,
        currency: formData.currency,
        status: TradeStatus.PENDING,
        user_id: '', // Will be set by the service
        rate: 0, // Will be set by the service
        total: 0, // Will be set by the service
        fees: {
          platform: 0,
          processing: 0,
          total: 0
        },
        created_at: new Date().toISOString(), // Add this line
        updated_at: new Date().toISOString()  // Add this line if required
      });
    } catch (error) {
      console.error('Trade error:', error);
      setStep('input');
    }
  };

  if (step === 'review') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Review Trade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">{formatCurrency(Number(formData.amount))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Currency</span>
              <span className="font-medium">{formData.currency.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium">{formData.paymentMethod.replace('_', ' ').toUpperCase()}</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setStep('input')} className="flex-1">
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
              Confirm Trade
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Currency</label>
        <Select 
          value={formData.currency} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_CURRENCIES.map((currency) => (
              <SelectItem key={currency.value} value={currency.value}>
                {currency.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Amount</label>
        <Input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          placeholder="Enter amount"
          min="0"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Payment Method</label>
        <Select 
          value={formData.paymentMethod} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value as PaymentMethodType }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS[type].map((method) => (
              <SelectItem key={method} value={method}>
                {method.replace('_', ' ').toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Available Balance</span>
        <span>{formatCurrency(balance)}</span>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        Review Trade <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
} 