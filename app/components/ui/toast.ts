import { ToastAction } from "@radix-ui/react-toast";

export interface Toast {
    title?: string;
    description?: string;
    action?: ToastAction;
    variant?: 'default' | 'destructive' | 'warning';
  }
  
  export interface ToastAction {
    altText: string;
    onClick: () => void;
    children?: React.ReactNode;
  }
  
  export type ToastActionElement = React.ReactElement<typeof ToastAction>;