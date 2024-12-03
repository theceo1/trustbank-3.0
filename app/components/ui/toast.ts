import create from 'zustand';

export interface ToastProps {
  id: string;
  title: string;
  description: string;
  variant: 'warning' | 'destructive' | 'default';
}

interface ToastState {
  toasts: ToastProps[];
  addToast: (toast: ToastProps) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts.filter((t) => t.id !== toast.id), toast],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export function showToast(props: ToastProps) {
  const { addToast, removeToast } = useToastStore.getState();
  
  // Add the toast
  addToast(props);
  
  // Automatically remove the toast after 5 seconds
  setTimeout(() => {
    removeToast(props.id);
  }, 5000);
}

// Helper function to create toast variants
export function createToast(
  id: string,
  title: string,
  description: string,
  variant: ToastProps['variant'] = 'default'
): ToastProps {
  return {
    id,
    title,
    description,
    variant,
  };
} 