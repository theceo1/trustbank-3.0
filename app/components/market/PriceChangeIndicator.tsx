import { TrendingUp, TrendingDown } from "lucide-react";

interface PriceChangeIndicatorProps {
  change: number;
}

export function PriceChangeIndicator({ change }: PriceChangeIndicatorProps) {
  return (
    <div className={`flex items-center ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
      {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
      <span className="ml-1">{Math.abs(change).toFixed(2)}%</span>
    </div>
  );
}