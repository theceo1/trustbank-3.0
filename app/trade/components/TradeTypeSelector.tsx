import { Button } from "@/components/ui/button";
import { TradeType } from "@/app/types/trade";
import { Copy, Send, Wallet, ArrowLeftRight } from 'lucide-react';

interface TradeSelectorProps {
  value: TradeType;
  onChange: (type: TradeType) => void;
}

export function TradeTypeSelector({ value, onChange }: TradeSelectorProps) {
  const types: { type: TradeType; label: string; icon: JSX.Element }[] = [
    { type: 'buy', label: 'Buy', icon: <Wallet className="h-4 w-4" /> },
    { type: 'sell', label: 'Sell', icon: <Copy className="h-4 w-4" /> },
    { type: 'swap', label: 'Swap', icon: <ArrowLeftRight className="h-4 w-4" /> },
    { type: 'send', label: 'Send', icon: <Send className="h-4 w-4" /> }
  ];

  return (
    <div className="flex gap-2">
      {types.map(({ type, label, icon }) => (
        <Button
          key={type}
          variant={value === type ? "default" : "outline"}
          onClick={() => onChange(type)}
          className="flex-1"
        >
          {icon}
          <span className="ml-2">{label}</span>
        </Button>
      ))}
    </div>
  );
} 