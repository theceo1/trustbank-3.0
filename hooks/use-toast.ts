// hooks/use-toast.ts
'use client';

import { toast } from 'sonner';

type ToastProps = {
  id?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
};

export function useToast() {
  function showToast({ title, description, variant = 'default' }: ToastProps) {
    switch (variant) {
      case 'destructive':
        toast.error(title, { description });
        break;
      case 'success':
        toast.success(title, { description });
        break;
      case 'warning':
        toast.warning(title, { description });
        break;
      default:
        toast(title, { description });
    }
  }

  return {
    toast: showToast,
  };
}