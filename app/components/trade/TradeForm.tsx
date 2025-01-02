//app/components/trade/TradeForm.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { QuidaxMarketService } from '../../lib/services/quidax-market';
import { formatCurrency } from '../../lib/utils';

const tradeFormSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  market: z.string().default('btcngn'),
  type: z.enum(['buy', 'sell']).default('buy'),
});

type TradeFormValues = z.infer<typeof tradeFormSchema>;

interface QuoteData {
  rate: number;
  total: number;
  fee: number;
  receive: number;
}

export default function TradeForm() {
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const { toast } = useToast();
  
  const form = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema),
    defaultValues: {
      amount: '',
      market: 'btcngn',
      type: 'buy',
    },
  });

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const getQuote = async (values: TradeFormValues) => {
    try {
      setLoading(true);
      const quoteData = await QuidaxMarketService.getQuote({
        market: values.market,
        unit: values.market.slice(0, -3).toUpperCase(),
        kind: values.type,
        volume: parseFloat(values.amount),
      });
      
      setQuote(quoteData);
      setCountdown(14); // Start 14 second countdown
      
      toast({
        title: 'Quote received',
        description: 'Please review and proceed within 14 seconds',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to get quote',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: TradeFormValues) => {
    if (!quote || countdown === 0) {
      // If no quote or quote expired, get new quote
      await getQuote(values);
      return;
    }
    
    // Proceed with trade using the quote
    try {
      // TODO: Implement trade execution
      toast({
        title: 'Trade submitted',
        description: 'Your trade has been submitted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit trade',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="any"
          placeholder="Enter amount"
          {...form.register('amount')}
        />
        {form.formState.errors.amount && (
          <p className="text-sm text-red-500">
            {form.formState.errors.amount.message}
          </p>
        )}
      </div>

      {quote && countdown > 0 && (
        <div className="p-4 border rounded-lg space-y-2 bg-secondary/10">
          <div className="flex justify-between">
            <span>Quote expires in:</span>
            <span className="font-bold">{countdown}s</span>
          </div>
          <div className="flex justify-between">
            <span>Rate:</span>
            <span className="font-bold">{formatCurrency(quote.rate, 'NGN')}</span>
          </div>
          <div className="flex justify-between">
            <span>You'll receive:</span>
            <span className="font-bold">{formatCurrency(quote.receive, 'NGN')}</span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.handleSubmit(getQuote)()}
          disabled={loading}
          className="flex-1"
        >
          Get Quote
        </Button>
        
        <Button 
          type="submit"
          disabled={loading || !quote || countdown === 0}
          className="flex-1"
        >
          {quote && countdown > 0 ? 'Proceed' : 'Trade'}
        </Button>
      </div>
    </form>
  );
} 