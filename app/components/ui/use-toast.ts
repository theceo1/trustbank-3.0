import * as React from "react";
import { Toast } from "@/components/ui/toast";

interface UseToast {
  toast: (props: Toast) => void;
}

export function useToast(): UseToast {
  const toast = React.useCallback((props: Toast) => {
    // Implementation of toast notification 
    console.log('Toast:', props);
  }, []);

  return { toast };
}