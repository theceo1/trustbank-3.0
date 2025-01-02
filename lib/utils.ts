import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type CurrencyFormatOptions = {
  style: 'currency' | 'decimal';
  currency?: string;
  maximumFractionDigits: number;
};

export function formatCurrency(amount: number, currency: string) {
  const currencyMap: { [key: string]: CurrencyFormatOptions } = {
    // Fiat currencies
    ngn: { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 },
    usd: { style: 'currency', currency: 'USD', maximumFractionDigits: 2 },
    eur: { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 },
    gbp: { style: 'currency', currency: 'GBP', maximumFractionDigits: 2 },
    // Cryptocurrencies
    btc: { style: 'decimal', maximumFractionDigits: 8 },
    eth: { style: 'decimal', maximumFractionDigits: 6 },
    usdt: { style: 'decimal', maximumFractionDigits: 2 },
    usdc: { style: 'decimal', maximumFractionDigits: 2 },
  };

  const options = currencyMap[currency.toLowerCase()] || { style: 'decimal', maximumFractionDigits: 8 };
  const formatter = new Intl.NumberFormat('en-US', {
    ...options,
    style: options.style === 'decimal' ? 'decimal' : 'currency'
  });
  const formatted = formatter.format(amount);

  // For cryptocurrencies, append the currency code
  if (options.style === 'decimal') {
    return `${formatted} ${currency.toUpperCase()}`;
  }

  return formatted;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date));
}

export function generateReference(prefix = 'TRX'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
