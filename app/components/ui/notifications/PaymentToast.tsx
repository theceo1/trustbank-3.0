import { Toast as ToastPrimitive } from '@radix-ui/react-toast';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Toast } from '@/components/ui/toast';
import { Toaster } from '@/components/ui/toaster';

interface PaymentToastProps extends Toast {
  icon?: React.ReactNode;
}

export function PaymentToastViewport() {
  const { toast } = useToast();

  return <Toaster />;
}