import { Button } from "@/components/ui/button";

interface TradeTypeSelectorProps {
  value: 'buy' | 'sell' | 'swap' | 'send';
  onChange: (value: 'buy' | 'sell' | 'swap' | 'send') => void;
}

export function TradeTypeSelector({ value, onChange }: TradeTypeSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      <Button
        variant={value === 'buy' ? 'default' : 'outline'}
        onClick={() => onChange('buy')}
        className={`w-full ${value === 'buy' ? 'bg-green-600 hover:bg-green-700 text-white' : 'text-black hover:text-black hover:bg-green-100'}`}
      >
        Buy
      </Button>
      <Button
        variant={value === 'sell' ? 'default' : 'outline'}
        onClick={() => onChange('sell')}
        className={`w-full ${value === 'sell' ? 'bg-green-600 hover:bg-green-700 text-white' : 'text-black hover:text-black hover:bg-green-100'}`}
      >
        Sell
      </Button>
      <Button
        variant={value === 'swap' ? 'default' : 'outline'}
        onClick={() => onChange('swap')}
        className={`w-full ${value === 'swap' ? 'bg-green-600 hover:bg-green-700 text-white' : 'text-black hover:text-black hover:bg-green-100'}`}
      >
        Swap
      </Button>
      <Button
        variant={value === 'send' ? 'default' : 'outline'}
        onClick={() => onChange('send')}
        className={`w-full ${value === 'send' ? 'bg-green-600 hover:bg-green-700 text-white' : 'text-black hover:text-black hover:bg-green-100'}`}
      >
        Send
      </Button>
    </div>
  );
} 