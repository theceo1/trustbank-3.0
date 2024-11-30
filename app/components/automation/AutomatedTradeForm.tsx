import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AutomatedTradingService } from '@/app/lib/services/automation/AutomatedTradingService';
import { TrustBankLogo } from '@/app/components/brand/TrustBankLogo';
import { toast } from 'sonner';

interface AutomatedTradeFormProps {
  userId: string;
  currency: string;
}

export function AutomatedTradeForm({ userId, currency }: AutomatedTradeFormProps) {
  const [amount, setAmount] = useState<number>();
  const [targetRate, setTargetRate] = useState<number>();
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [expiresAt, setExpiresAt] = useState<Date>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !targetRate) return;

    try {
      await AutomatedTradingService.createTradeRule({
        userId,
        currency,
        amount,
        targetRate,
        tradeType,
        expiresAt
      });

      toast.success('Automated Trade Rule Created', {
        description: 'Your trade will execute automatically when conditions are met.',
      });
    } catch (error) {
      toast.error('Failed to create automated trade rule. Please try again.');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-slate-50 to-white shadow-xl">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <TrustBankLogo className="h-8 w-auto" />
          <span className="text-sm text-muted-foreground">Automated Trading</span>
        </div>
        <h3 className="text-2xl font-semibold">Set Up Automated Trade</h3>
      </CardHeader>
      {/* Form content similar to RateAlertForm but with trade-specific fields */}
    </Card>
  );
}