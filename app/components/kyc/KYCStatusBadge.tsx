// app/components/kyc/KYCStatusBadge.tsx
import { Badge } from "@/components/ui/badge";
import { KYCStatus } from "@/app/types/kyc";

interface KYCStatusBadgeProps {
  status: KYCStatus;
}

export function KYCStatusBadge({ status }: KYCStatusBadgeProps) {
  const getVariant = () => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
      case 'unverified':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Badge variant={getVariant()}>
      {status.toUpperCase()}
    </Badge>
  );
}