import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

export function MarketStatCard({ icon, title, value }: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}) {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
      {currentTime && (
        <p className="text-sm text-muted-foreground mt-2">
          Last updated: {currentTime}
        </p>
      )}
    </Card>
  );
}