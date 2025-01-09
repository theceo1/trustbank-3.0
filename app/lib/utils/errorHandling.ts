"use client";

import { QuidaxError } from '@/app/lib/services/quidax';
import { type ToastProps } from '@/hooks/use-toast';

type ToastFn = (props: Partial<ToastProps> & Pick<ToastProps, 'title'>) => void;

export const handleError = (error: unknown, defaultMessage: string, toast: ToastFn) => {
  if (error instanceof QuidaxError) {
    toast({
      variant: "destructive",
      title: "Transaction Error",
      description: error.message
    });
    
    // Log specific error types
    switch (error.code) {
      case 'RATE_EXPIRED':
        logError('Rate expired during transaction', error);
        break;
      case 'INSUFFICIENT_BALANCE':
        logError('Insufficient balance for wallet payment', error);
        break;
      case 'FRAUD_DETECTED':
        logError('Fraud detection triggered', error);
        break;
      default:
        logError('Unknown transaction error', error);
    }
  } else {
    toast({
      variant: "destructive",
      title: "Error",
      description: defaultMessage
    });
    logError(defaultMessage, error);
  }
};
  
const logError = (message: string, error: unknown) => {
  console.error(`${message}:`, error);
  // Add your error logging service here
};