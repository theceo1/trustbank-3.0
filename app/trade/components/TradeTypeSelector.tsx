import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ShoppingCart, Banknote, ArrowLeftRight, Send } from "lucide-react";

export type TradeType = 'buy' | 'sell' | 'swap' | 'send';

interface TradeSelectorProps {
  value: TradeType;
  onChange: (type: TradeType) => void;
}

export function TradeTypeSelector({ value, onChange }: TradeSelectorProps) {
  const tradeTypes = [
    { type: 'buy', label: 'Buy', icon: ShoppingCart },
    { type: 'sell', label: 'Sell', icon: Banknote },
    { type: 'swap', label: 'Swap', icon: ArrowLeftRight },
    { type: 'send', label: 'Send', icon: Send }
  ] as const;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {tradeTypes.map(({ type, label, icon: Icon }) => (
        <motion.button
          key={type}
          onClick={() => onChange(type)}
          className={cn(
            "relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all",
            "hover:bg-white dark:hover:bg-gray-700",
            "focus:outline-none focus:ring-2 focus:ring-primary/50",
            value === type ? 
              "bg-green-600 text-white shadow-lg" : 
              "text-gray-600 dark:text-gray-300"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Icon className="h-4 w-4" />
          {label}
          {value === type && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute inset-0 bg-green-600 rounded-md -z-10"
              transition={{ type: "spring", duration: 0.5 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
} 