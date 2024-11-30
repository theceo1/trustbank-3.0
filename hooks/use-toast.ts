//app/hooks/use-toast.ts
import * as React from "react"

import { Toast } from "@/app/components/ui/toast";
import { useToast as useToastPrimitive } from "@/app/components/ui/use-toast";

export interface ToastProps extends Omit<Toast, 'action'> {
  action?: React.ReactElement;
}

export function useToast() {
  const { toast } = useToastPrimitive();
  return { toast };
}