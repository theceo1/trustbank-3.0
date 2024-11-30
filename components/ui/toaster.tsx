'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';
import { cn } from "@/lib/utils";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
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
      {...props}
    />
  );
} 
