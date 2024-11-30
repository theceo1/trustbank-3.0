import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Shield, ShieldAlert, ShieldQuestion } from "lucide-react"; 
import { KYCStatusType } from "@/app/types/kyc";

interface KYCStatusBadgeProps {
  status: KYCStatusType;
}

export function KYCStatusBadge({ status }: KYCStatusBadgeProps) {
  const statusConfig = {
    verified: {
      color: "bg-green-100 text-green-800",
      icon: ShieldCheck,
      label: "Verified"
    },
    pending: {
      color: "bg-yellow-100 text-yellow-800",
      icon: Shield,
      label: "Pending"
    },
    rejected: {
      color: "bg-red-100 text-red-800",
      icon: ShieldAlert,
      label: "Rejected"
    },
    unverified: {
      color: "bg-gray-100 text-gray-800",
      icon: ShieldQuestion,
      label: "Unverified"
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="w-4 h-4 mr-1" />
      <span>{config.label}</span>
    </Badge>
  );
}