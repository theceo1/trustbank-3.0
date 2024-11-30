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
  
  export const formatNumber = (value: number, compact = false): string => {
    return new Intl.NumberFormat('en-US', {
      notation: compact ? 'compact' : 'standard',
      maximumFractionDigits: 2
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
  
  export const formatCryptoAmount = (amount: number): string => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 8,
      maximumFractionDigits: 8
    });
  };