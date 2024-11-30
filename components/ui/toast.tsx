import * as React from "react"
import { Toaster as RadixToaster } from "sonner"

export type ToastVariants = 'default' | 'destructive' | 'success' | 'warning';

export interface ToasterToast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariants;
}

export interface Toast extends ToasterToast {
  variant?: ToastVariants;
}

export function Toaster() {
  return <RadixToaster />;
}