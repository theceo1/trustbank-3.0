import { ReactNode } from 'react';

export interface ToastAction {
  altText: string;
  children: ReactNode;
}

export interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  action?: ToastAction;
} 