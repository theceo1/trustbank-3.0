import { useEffect, useState } from 'react';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RateExpiryTimerProps {
  expiryDate: Date | null;
  onRefresh: () => void;
  isLoading?: boolean;
}

export default function RateExpiryTimer({ expiryDate, onRefresh, isLoading = false }: RateExpiryTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!expiryDate) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = expiryDate.getTime() - now.getTime();
      setTimeLeft(Math.max(0, Math.floor(diff / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryDate]);

  if (!expiryDate) return null;

  if (timeLeft === 0) {
    return (
      <Button 
        onClick={onRefresh}
        variant="outline"
        size="sm"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Refreshing...
          </>
        ) : (
          'Refresh Rate'
        )}
      </Button>
    );
  }

  return (
    <div className="text-sm text-muted-foreground">
      Rate expires in: {timeLeft}s
    </div>
  );
}