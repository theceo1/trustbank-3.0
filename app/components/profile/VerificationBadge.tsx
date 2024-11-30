import { Shield, CheckCircle, XCircle } from "lucide-react";

interface VerificationBadgeProps {
  isVerified: boolean;
}

export default function VerificationBadge({ isVerified }: VerificationBadgeProps) {
  return (
    <div className={`flex items-center gap-2 ${isVerified ? 'text-green-600' : 'text-red-500'}`}>
      {isVerified ? (
        <>
          <CheckCircle className="h-4 w-4" />
          <span>Verified Account</span>
        </>
      ) : (
        <>
          <XCircle className="h-4 w-4" />
          <span>Unverified Account</span>
        </>
      )}
    </div>
  );
}