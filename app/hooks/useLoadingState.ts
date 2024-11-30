import { useState, useCallback } from 'react';

export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState<Error | null>(null);

  const withLoading = useCallback(async <T>(
    fn: () => Promise<T>
  ): Promise<T> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fn();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    withLoading,
    setError,
    reset: () => {
      setIsLoading(false);
      setError(null);
    }
  };
}