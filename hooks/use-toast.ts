// hooks/use-toast.ts
'use client';

import { toast } from '@/components/ui/toast';

type ToastProps = {
  id?: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'warning';
};

export const useToast = () => {
  const showToast = (props: ToastProps) => {
    if (props.variant === 'destructive') {
      return toast.error(props.title, props.description);
    } else if (props.variant === 'warning') {
      return toast.warning(props.title, props.description);
    } else {
      return toast.success(props.title, props.description);
    }
  };

  return { toast: showToast };
};