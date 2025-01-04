import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  if (isNaN(amount)) return '0.00';

  const currencyConfig: Record<string, Intl.NumberFormatOptions> = {
    NGN: { style: 'currency', currency: 'NGN', minimumFractionDigits: 2, maximumFractionDigits: 2 },
    USD: { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 },
    USDT: { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 6 },
    BTC: { style: 'decimal', minimumFractionDigits: 8, maximumFractionDigits: 8 },
    ETH: { style: 'decimal', minimumFractionDigits: 6, maximumFractionDigits: 8 },
  };

  const config = currencyConfig[currency] || { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 6 };
  const formatter = new Intl.NumberFormat('en-US', config);
  const formatted = formatter.format(amount);

  if (config.style === 'currency') {
    return formatted.replace('NGN', '₦');
  }

  return `${formatted} ${currency}`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function formatNumber(number: number): string {
  return new Intl.NumberFormat('en-NG').format(number)
}

export function truncateText(text: string, length: number = 30): string {
  if (text.length <= length) return text
  return `${text.slice(0, length)}...`
}

export function getInitials(name: string): string {
  if (!name) return ''
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function generateId(): string {
  return Math.random().toString(36).slice(2)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}