import { useState, useCallback } from 'react';

interface UseOptimisticUpdateOptions<T> {
  mutationFn: () => Promise<T>;
  optimisticData: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useOptimisticUpdate<T>({
  mutationFn,
  optimisticData,
  onSuccess,
  onError
}: UseOptimisticUpdateOptions<T>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await mutationFn();
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [mutationFn, onSuccess, onError]);

  return { mutate, isLoading, error };
}