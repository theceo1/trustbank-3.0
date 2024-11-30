import { Button } from '@/components/ui/button';

interface CurrencySelectorProps {
  currencies: string[];
  selected: string;
  onSelect: (currency: string) => void;
}

export function CurrencySelector({ currencies, selected, onSelect }: CurrencySelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {currencies.map((currency) => (
        <Button
          key={currency}
          variant={selected === currency ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(currency)}
        >
          {currency}
        </Button>
      ))}
    </div>
  );
}