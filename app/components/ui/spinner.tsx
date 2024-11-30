import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
}

export function Spinner() {
  return (
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
  );
}