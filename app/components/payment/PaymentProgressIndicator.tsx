import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { PaymentStatusTracker } from '@/app/lib/services/realtime/PaymentStatusTracker';
import { PaymentProgressIndicatorProps, PaymentStatus } from '@/app/types/payment';
import { formatTime } from '@/app/utils/formatTime';

const progressMap: Record<PaymentStatus, number> = {
  'initiated': 0,
  'pending': 25,
  'processing': 50,
  'confirming': 75,
  'completed': 100,
  'failed': 0
};

export function PaymentProgressIndicator({ 
  status,
  showEstimatedTime = true
}: PaymentProgressIndicatorProps) {
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    const estimatedTime = PaymentStatusTracker.getEstimatedTimeRemaining(status);
    setTimeRemaining(estimatedTime);

    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    setProgress(progressMap[status] || 0);
  }, [status]);

  return (
    <div className="space-y-2">
      <Progress 
        value={progress} 
        className="h-2"
      />
      
      {showEstimatedTime && timeRemaining > 0 && (
        <p className="text-sm text-gray-500 text-center">
          Estimated time remaining: {formatTime(timeRemaining)}
        </p>
      )}
    </div>
  );
}