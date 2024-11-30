import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TradeType, TradeRateResponse } from "@/app/types/trade";
import { formatCurrency } from "@/app/lib/utils";

interface StandardTradeFormProps {
  type: TradeType;
  currency: string;
  amount: string;
  rate: TradeRateResponse | null;
  onCurrencyChange: (currency: string) => void;
  onAmountChange: (amount: string) => void;
}

export function StandardTradeForm({
  type,
  currency,
  amount,
  rate,
  onCurrencyChange,
  onAmountChange
}: StandardTradeFormProps) {
  const SUPPORTED_CURRENCIES = [
    { value: 'btc', label: 'Bitcoin (BTC)' },
    { value: 'eth', label: 'Ethereum (ETH)' },
    { value: 'usdt', label: 'Tether (USDT)' }
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select Currency</Label>
        <Select value={currency} onValueChange={onCurrencyChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_CURRENCIES.map(curr => (
              <SelectItem key={curr.value} value={curr.value}>
                {curr.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Amount</Label>
        <Input
          type="number"
          min="0"
          step="0.00000001"
          value={amount}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '' || Number(value) >= 0) {
              onAmountChange(value);
            }
          }}
          placeholder="0.00"
        />
      </div>

      {rate && (
        <div className="text-sm text-muted-foreground">
          <p>Rate: 1 {currency.toUpperCase()} = ${formatCurrency(rate.rate)}</p>
          <p>Total: ${formatCurrency(rate.total)}</p>
        </div>
      )}
    </div>
  );
} 