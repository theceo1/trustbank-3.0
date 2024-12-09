//app/components/trade/TradeForm.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface TradeQuote {
  quotation_id: string;
  rate: string;
  total: string;
  receive_amount: string;
  fee: string;
  expires_at: string;
}

export default function TradeForm() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [quote, setQuote] = useState<TradeQuote | null>(null);
  
  const [formData, setFormData] = useState({
    fromCurrency: 'USDT',
    toCurrency: 'NGN',
    amount: '',
    type: 'sell' as 'buy' | 'sell'
  });

  const currencies = [
    { value: 'USDT', label: 'USDT' },
    { value: 'BTC', label: 'Bitcoin' },
    { value: 'ETH', label: 'Ethereum' },
    { value: 'NGN', label: 'Nigerian Naira' }
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (quote && countdown === 0) {
      setQuote(null); // Clear quote when countdown ends
    }
    return () => clearInterval(timer);
  }, [countdown, quote]);

  const getQuote = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/trades/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to get quote');
      
      const data = await response.json();
      setQuote(data);
      setCountdown(14); // Start 14 second countdown
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get trade quote',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!quote) {
        // Get initial quote
        const quoteRes = await fetch('/api/trades/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        const quoteData = await quoteRes.json();
        if (!quoteData.error) {
          setQuote(quoteData);
          setCountdown(14);
        } else {
          throw new Error(quoteData.error);
        }
      } else {
        // Execute trade
        const tradeRes = await fetch('/api/trades/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            quotationId: quote.quotation_id
          })
        });
        
        const tradeData = await tradeRes.json();
        if (tradeData.error) {
          throw new Error(tradeData.error);
        }
        
        // Reset form and show success
        setQuote(null);
        setFormData({
          fromCurrency: 'USDT',
          toCurrency: 'NGN',
          amount: '',
          type: 'sell'
        });
        toast({
          title: 'Trade Executed',
          description: 'Your trade has been successfully executed'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'buy' | 'sell' }))}
        >
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </Select>

        <Select
          value={formData.fromCurrency}
          onValueChange={(value) => setFormData(prev => ({ ...prev, fromCurrency: value }))}
        >
          {currencies.map(currency => (
            <option key={currency.value} value={currency.value}>
              {currency.label}
            </option>
          ))}
        </Select>

        <Select
          value={formData.toCurrency}
          onValueChange={(value) => setFormData(prev => ({ ...prev, toCurrency: value }))}
        >
          {currencies.map(currency => (
            <option key={currency.value} value={currency.value}>
              {currency.label}
            </option>
          ))}
        </Select>

        <Input
          type="number"
          placeholder="Amount"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          min="0"
          step="any"
          required
        />
      </div>

      {quote && (
        <div className="bg-secondary p-4 rounded-lg space-y-2">
          <p>Rate: {quote.rate}</p>
          <p>You&apos;ll receive: {quote.receive_amount}</p>
          <p>Fee: {quote.fee}</p>
          <p>Expires in: {countdown} seconds</p>
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Processing...' : quote ? 'Confirm Trade' : 'Get Quote'}
      </Button>
    </form>
  );
} 