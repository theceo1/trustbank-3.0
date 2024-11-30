import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { RateAlertService } from '@/app/lib/services/alerts/RateAlertService';
import { TrustBankLogo } from '@/app/components/brand/TrustBankLogo';
import { AlertCondition } from '@/app/types/alerts';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';

interface RateAlertFormProps {
  userId: string;
  currency: string;
}

export function RateAlertForm({ userId, currency }: RateAlertFormProps) {
  const [targetRate, setTargetRate] = useState<number>();
  const [condition, setCondition] = useState<AlertCondition>('above');
  const [notificationMethod, setNotificationMethod] = useState<'email' | 'push' | 'both'>('both');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRate) return;

    try {
      await RateAlertService.createAlert({
        userId,
        currency,
        targetRate,
        condition,
        notificationMethod
      });
      toast.success('Alert Created', {
        description: 'We\'ll notify you when your target rate is reached.'
      });
    } catch (error) {
      toast.error('Failed to create alert. Please try again.');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-xl">
      <CardHeader className="space-y-1 flex items-center justify-between">
        <TrustBankLogo className="h-8 w-auto" />
        <h3 className="text-2xl font-semibold">Set Rate Alert</h3>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Rate</label>
            <Input
              type="number"
              step="0.0001"
              value={targetRate}
              onChange={(e) => setTargetRate(parseFloat(e.target.value))}
              placeholder="Enter target rate"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Condition</label>
            <Select
              value={condition}
              onValueChange={(value) => setCondition(value as AlertCondition)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">Above</SelectItem>
                <SelectItem value="below">Below</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notification Method</label>
            <Select
              value={notificationMethod}
              onValueChange={(value) => setNotificationMethod(value as 'email' | 'push' | 'both')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select notification method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="push">Push Notification</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Create Alert
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}