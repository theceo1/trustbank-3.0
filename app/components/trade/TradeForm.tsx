//app/components/trade/TradeForm.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { QuidaxSwapService } from '../../lib/services/quidax-swap';
import { useAuth } from '@/app/context/AuthContext';
import { useKYC } from '@/app/hooks/use-kyc';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { QuidaxQuotation } from '@/app/types/quidax';
import { AlertDescription } from '../ui/alert';

const SUPPORTED_CURRENCIES = [
  { value: 'btc', label: 'Bitcoin (BTC)' },
  { value: 'eth', label: 'Ethereum (ETH)' },
  { value: 'usdt', label: 'Tether (USDT)' },
  { value: 'sol', label: 'Solana (SOL)' },
  { value: 'bnb', label: 'BNB' },
  { value: 'matic', label: 'Polygon (MATIC)' },
  { value: 'xrp', label: 'Ripple (XRP)' },
  { value: 'doge', label: 'Dogecoin (DOGE)' },
  { value: 'ada', label: 'Cardano (ADA)' },
  { value: 'dot', label: 'Polkadot (DOT)' },
] as const;

const swapFormSchema = z.object({
  fromCurrency: z.string().min(1, 'From currency is required'),
  toCurrency: z.string().min(1, 'To currency is required'),
  amount: z.string().min(1, 'Amount is required'),
});

type SwapFormValues = z.infer<typeof swapFormSchema>;

export default function TradeForm() {
  const [loading, setLoading] = useState(false);
  const [quotation, setQuotation] = useState<QuidaxQuotation | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [selectedFromCurrency, setSelectedFromCurrency] = useState('usdt');
  const [selectedToCurrency, setSelectedToCurrency] = useState('btc');
  const { toast } = useToast();
  const { user } = useAuth();
  const { checkTradeLimits, redirectToVerification } = useKYC();
  
  const form = useForm<SwapFormValues>({
    resolver: zodResolver(swapFormSchema),
    defaultValues: {
      fromCurrency: selectedFromCurrency,
      toCurrency: selectedToCurrency,
      amount: '',
    },
  });

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const getQuotation = async (values: SwapFormValues) => {
    console.log('[Trade] Getting quotation with values:', values);
    try {
      setLoading(true);

      // Check trade limits
      const amount = parseFloat(values.amount);
      const { allowed, reason, currentLimits } = await checkTradeLimits(amount);
      
      if (!allowed) {
        toast({
          title: 'Trade limit exceeded',
          description: reason,
          variant: 'destructive',
        });
        return;
      }

      const { data } = await QuidaxSwapService.createSwapQuotation({
        user_id: user?.id || 'me',
        from_currency: values.fromCurrency,
        to_currency: values.toCurrency,
        from_amount: values.amount,
      });
      
      console.log('[Trade] Received quotation:', data);
      setQuotation(data);
      setSelectedFromCurrency(values.fromCurrency);
      setSelectedToCurrency(values.toCurrency);
      
      // Calculate countdown from expires_at
      const expiresAt = new Date(data.expires_at).getTime();
      const now = new Date().getTime();
      const timeLeft = Math.floor((expiresAt - now) / 1000);
      setCountdown(timeLeft);
      console.log('[Trade] Quote expires in:', timeLeft, 'seconds');
      
      toast({
        title: 'Quote received',
        description: 'Please review and confirm the swap within the time limit',
      });
    } catch (error: any) {
      console.error('[Trade] Error getting quotation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to get quotation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const executeSwap = async () => {
    if (!quotation || !user) {
      console.error('[Trade] Cannot execute swap: missing quotation or user');
      return;
    }
    
    console.log('[Trade] Executing swap with quotation:', quotation);
    try {
      setLoading(true);

      // Check trade limits again before executing
      const amount = parseFloat(quotation.from_amount);
      const { allowed, reason } = await checkTradeLimits(amount);
      
      if (!allowed) {
        toast({
          title: 'Trade limit exceeded',
          description: reason,
          variant: 'destructive',
        });
        return;
      }

      const { data } = await QuidaxSwapService.confirmSwap(user.id, quotation.id);
      console.log('[Trade] Swap confirmed:', data);
      
      toast({
        title: 'Swap successful',
        description: `Successfully swapped ${quotation.from_amount} ${selectedFromCurrency.toUpperCase()} to ${quotation.to_amount} ${selectedToCurrency.toUpperCase()}`,
      });
      
      // Reset form
      form.reset();
      setQuotation(null);
      setCountdown(0);
    } catch (error: any) {
      console.error('[Trade] Error executing swap:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to execute swap',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: SwapFormValues) => {
    console.log('[Trade] Form submitted with values:', values);
    if (!quotation || countdown === 0) {
      await getQuotation(values);
      return;
    }
    
    await executeSwap();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>From</Label>
          <Select
            onValueChange={(value) => {
              form.setValue('fromCurrency', value);
              setSelectedFromCurrency(value);
            }}
            defaultValue={selectedFromCurrency}
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
          <Label>To</Label>
          <Select
            onValueChange={(value) => {
              form.setValue('toCurrency', value);
              setSelectedToCurrency(value);
            }}
            defaultValue={selectedToCurrency}
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
          <Label>Amount</Label>
          <Input
            type="number"
            step="any"
            placeholder={`Enter amount in ${selectedFromCurrency.toUpperCase()}`}
            {...form.register('amount')}
          />
          {form.formState.errors.amount && (
            <p className="text-sm text-red-500">
              {form.formState.errors.amount.message}
            </p>
          )}
        </div>
      </div>

      {quotation && countdown > 0 && (
        <div className="p-4 border rounded-lg space-y-2 bg-secondary/10">
          <div className="flex justify-between">
            <span>Quote expires in:</span>
            <span className="font-bold">{countdown}s</span>
          </div>
          <div className="flex justify-between">
            <span>Rate:</span>
            <span className="font-bold">1 {selectedFromCurrency.toUpperCase()} = {parseFloat(quotation.quoted_price).toFixed(8)} {selectedToCurrency.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span>You&apos;ll receive:</span>
            <span className="font-bold">{parseFloat(quotation.to_amount).toFixed(8)} {selectedToCurrency.toUpperCase()}</span>
          </div>
        </div>
      )}

      <Button 
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <div className="flex items-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {quotation ? 'Confirming Swap' : 'Getting Quote'}
          </div>
        ) : quotation && countdown > 0 ? (
          'Confirm Swap'
        ) : (
          'Get Quote'
        )}
      </Button>
    </form>
  );
} 