import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  className?: string;
  status?: 'verified' | 'pending' | 'rejected';
  showLabel?: boolean;
}

export default function VerificationBadge({ 
  className, 
  status = 'verified',
  showLabel = false 
}: VerificationBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'verified':
        return {
          icon: CheckCircle2,
          color: 'text-green-500',
          label: 'Verified'
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          label: 'Pending'
        };
      case 'rejected':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          label: 'Rejected'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Icon className={cn("w-4 h-4", config.color)} />
      {showLabel && (
        <span className={cn("text-sm font-medium", config.color)}>
          {config.label}
        </span>
      )}
    </div>
  );
}