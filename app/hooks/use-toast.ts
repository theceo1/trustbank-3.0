'use client';

import { toast as sonnerToast } from 'sonner';

type ToastOptions = {
  id?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export function useToast() {
  const toast = {
    // For direct toast calls with full options
    ...sonnerToast,
    
    // For error toasts
    error: (title: string, options?: ToastOptions) => {
      sonnerToast.error(title, {
        id: options?.id,
        description: options?.description,
      });
    },

    // For success toasts
    success: (title: string, options?: ToastOptions) => {
      sonnerToast.success(title, {
        id: options?.id,
        description: options?.description,
      });
    },

    // For warning toasts
    warning: (title: string, options?: ToastOptions) => {
      sonnerToast.warning(title, {
        id: options?.id,
        description: options?.description,
      });
    }
  };

  return { toast };
}