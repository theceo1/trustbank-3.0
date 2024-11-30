import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TradeRateResponse } from "@/app/types/trade";
import { formatCurrency } from "@/app/lib/utils";

interface SwapFormProps {
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  rate: TradeRateResponse | null;
  onFromCurrencyChange: (currency: string) => void;
  onToCurrencyChange: (currency: string) => void;
  onAmountChange: (amount: string) => void;
}

export function SwapForm({
  fromCurrency,
  toCurrency,
  amount,
  rate,
  onFromCurrencyChange,
  onToCurrencyChange,
  onAmountChange
}: SwapFormProps) {
  const SUPPORTED_CURRENCIES = [
    { value: 'btc', label: 'Bitcoin (BTC)' },
    { value: 'eth', label: 'Ethereum (ETH)' },
    { value: 'usdt', label: 'Tether (USDT)' }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>From</Label>
          <Select value={fromCurrency} onValueChange={onFromCurrencyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CURRENCIES.map(currency => (
                <SelectItem 
                  key={currency.value} 
                  value={currency.value}
                  disabled={currency.value === toCurrency}
                >
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>To</Label>
          <Select value={toCurrency} onValueChange={onToCurrencyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CURRENCIES.map(currency => (
                <SelectItem 
                  key={currency.value} 
                  value={currency.value}
                  disabled={currency.value === fromCurrency}
                >
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Amount</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0.00"
        />
      </div>

      {rate && (
        <div className="text-sm text-muted-foreground">
          <p>Rate: 1 {fromCurrency.toUpperCase()} = {formatCurrency(rate.rate)} {toCurrency.toUpperCase()}</p>
          <p>You will receive: {formatCurrency(rate.total)} {toCurrency.toUpperCase()}</p>
        </div>
      )}
    </div>
  );
} 