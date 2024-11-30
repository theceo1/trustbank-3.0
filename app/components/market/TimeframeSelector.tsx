import { Button } from '@/components/ui/button';

interface TimeframeSelectorProps {
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  timeframes: string[];
}

export function TimeframeSelector({
  selectedTimeframe,
  onTimeframeChange,
  timeframes
}: TimeframeSelectorProps) {
  return (
    <div className="flex gap-2">
      {timeframes.map((timeframe) => (
        <button
          key={timeframe}
          onClick={() => onTimeframeChange(timeframe)}
          className={`px-3 py-1 rounded-md ${
            selectedTimeframe === timeframe
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          {timeframe}
        </button>
      ))}
    </div>
  );
}