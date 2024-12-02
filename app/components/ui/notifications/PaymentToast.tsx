// app/components/ui/notifications/PaymentToast.tsx
'use client';

import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';
import { cn } from "@/lib/utils";

interface PaymentToastProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'warning';
}

export function PaymentToastViewport() {
  const { theme = 'system' } = useTheme();
  
  return (
    <Toaster
      theme={theme as any}
      className={cn(
        "toaster group",
        "fixed bottom-4 right-4 z-50 w-full max-w-sm"
      )}
      toastOptions={{
        classNames: {
          toast: cn(
            "group toast",
            "bg-background text-foreground border-border shadow-lg",
            "data-[variant=destructive]:bg-destructive data-[variant=destructive]:text-destructive-foreground",
            "data-[variant=warning]:bg-warning data-[variant=warning]:text-warning-foreground"
          ),
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
    />
  );
}