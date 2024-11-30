import { DollarSign } from 'lucide-react';

interface CurrentPriceProps {
  price: number;
}

export function CurrentPrice({ price }: CurrentPriceProps) {
  return (
    <div className="flex items-center space-x-2">
      <DollarSign className="h-4 w-4 text-muted-foreground" />
      <span className="text-xl font-mono">
        {price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </span>
    </div>
  );
}