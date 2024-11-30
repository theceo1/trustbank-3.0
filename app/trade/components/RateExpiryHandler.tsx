import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface RateExpiryHandlerProps {
  expiryTime: number;
  onExpiry: () => void;
  onRefresh: () => Promise<void>;
}

export function RateExpiryHandler({ expiryTime, onExpiry, onRefresh }: RateExpiryHandlerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = expiryTime - Date.now();
      setTimeLeft(Math.max(0, difference));
      
      if (difference <= 0) {
        onExpiry();
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiryTime, onExpiry]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (timeLeft === 0) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex items-center justify-between">
          Rate has expired
          <Button
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Rate
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert>
      <AlertDescription>
        Rate expires in {Math.ceil(timeLeft / 1000)} seconds
      </AlertDescription>
    </Alert>
  );
}