'use client';

import { toast as sonnerToast } from 'sonner';

type ToastProps = {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

interface ExtendedToast {
  (props: ToastProps): void;
  error(title: string, options?: Omit<ToastProps, 'title'>): void;
  success(title: string, options?: Omit<ToastProps, 'title'>): void;
  warning(title: string, options?: Omit<ToastProps, 'title'>): void;
  info(title: string, options?: Omit<ToastProps, 'title'>): void;
}

export function useToast() {
  const toast = sonnerToast as unknown as ExtendedToast;

  toast.error = (title: string, options?: Omit<ToastProps, 'title'>) => {
    sonnerToast.error(title, options);
  };

  toast.success = (title: string, options?: Omit<ToastProps, 'title'>) => {
    sonnerToast.success(title, options);
  };

  toast.warning = (title: string, options?: Omit<ToastProps, 'title'>) => {
    sonnerToast.warning(title, options);
  };

  toast.info = (title: string, options?: Omit<ToastProps, 'title'>) => {
    sonnerToast.info(title, options);
  };

  return { toast };
}