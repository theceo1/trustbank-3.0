import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cn } from "../../lib/utils"

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'warning';
}

const ToastProvider = ToastPrimitives.Provider
const ToastViewport = ToastPrimitives.Viewport
const Toast = ToastPrimitives.Root
const ToastTitle = ToastPrimitives.Title
const ToastDescription = ToastPrimitives.Description
const ToastClose = ToastPrimitives.Close

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
} 