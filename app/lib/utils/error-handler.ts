import { QuidaxError } from '../services/quidax';

export class TransactionError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public retry?: boolean
  ) {
    super(message);
    this.name = 'TransactionError';
  }
}

export function handleTransactionError(error: unknown): TransactionError {
  if (error instanceof QuidaxError) {
    const statusCode = error.statusCode || (error.code?.startsWith('5') ? 500 : 400);
    const shouldRetry = error.statusCode === 503 || error.code === 'SERVICE_UNAVAILABLE';
    
    return new TransactionError(
      error.message,
      error.code || 'QUIDAX_ERROR',
      statusCode,
      shouldRetry
    );
  }

  if (error instanceof Error) {
    return new TransactionError(
      error.message,
      'INTERNAL_ERROR',
      500,
      true
    );
  }

  return new TransactionError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    500,
    false
  );
}