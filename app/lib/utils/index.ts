export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function formatCryptoAmount(amount: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8
  });
}