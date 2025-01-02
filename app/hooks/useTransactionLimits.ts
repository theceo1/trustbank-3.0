import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface TransactionLimits {
  daily: {
    used: number;
    limit: number;
  };
  monthly: {
    used: number;
    limit: number;
  };
}

export function useTransactionLimits() {
  const { data: session } = useSession();
  const [limits, setLimits] = useState<TransactionLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLimits = async () => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/transaction-limits');
        if (!response.ok) {
          throw new Error('Failed to fetch transaction limits');
        }

        const data = await response.json();
        setLimits(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
        console.error('Error fetching transaction limits:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLimits();
  }, [session]);

  const refreshLimits = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/transaction-limits');
      if (!response.ok) {
        throw new Error('Failed to fetch transaction limits');
      }

      const data = await response.json();
      setLimits(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      console.error('Error refreshing transaction limits:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    limits,
    isLoading,
    error,
    refreshLimits,
  };
} 