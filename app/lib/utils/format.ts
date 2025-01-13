export const formatCurrency = (
    value: number,
    currency = 'USD',
    compact = false
  ): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      notation: compact ? 'compact' : 'standard',
      maximumFractionDigits: 2
    }).format(value);
  };
  
  export const formatNumber = (value: number, options: Intl.NumberFormatOptions = {}): string => {
    return new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
      ...options
    }).format(value);
  };
  
  export const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(2)}%`;
  };
  
  export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  export function formatCryptoAmount(amount: string | number | undefined | null, decimals: number = 8): string {
    if (amount === undefined || amount === null) return '0';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '0';
    return numAmount.toFixed(decimals).replace(/\.?0+$/, '');
  }