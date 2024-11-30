import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';

interface OptimisticProgressProps {
  status: 'processing' | 'completed' | 'failed';
  duration?: number;
}

export function OptimisticProgress({ 
  status, 
  duration = 3000 
}: OptimisticProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === 'processing') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90; // Hold at 90% until complete
          return prev + 10;
        });
      }, duration / 10);

      return () => clearInterval(interval);
    }

    if (status === 'completed') {
      setProgress(100);
    }
  }, [status, duration]);

  return (
    <div className="space-y-2">
      <Progress 
        value={progress} 
        className="h-2"
      />
      
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Processing Payment</span>
        {status === 'completed' && (
          <span className="text-green-600 flex items-center">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            Complete
          </span>
        )}
        {status === 'failed' && (
          <span className="text-red-600 flex items-center">
            <XCircleIcon className="w-4 h-4 mr-1" />
            Failed
          </span>
        )}
      </div>
    </div>
  );
}