export const formatCurrency = (amount: number, currency = 'NGN'): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    notation: 'standard'
  }).format(amount);
};

export const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date));
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

export const formatCryptoAmount = (amount: number): string => {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8
  });
};

export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}