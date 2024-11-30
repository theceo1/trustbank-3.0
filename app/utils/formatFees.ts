export function formatFees(fees: number | { [key: string]: number }): string {
    if (typeof fees === 'number') {
      return `${(fees * 100).toFixed(1)}%`;
    }
    
    return Object.entries(fees)
      .map(([key, value]) => `${key}: ${(value * 100).toFixed(1)}%`)
      .join(' + ');
  }