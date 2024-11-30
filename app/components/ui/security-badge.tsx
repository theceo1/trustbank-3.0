import { Shield } from 'lucide-react';

export function SecurityBadge({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Shield className="h-5 w-5 text-green-500" />
      <span className="text-sm font-medium text-gray-600">Secure Payment</span>
    </div>
  );
}