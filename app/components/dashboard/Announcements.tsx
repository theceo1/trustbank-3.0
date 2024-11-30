import { Shield, Bell, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface AnnouncementProps {
  isVerified: boolean;
}

export default function Announcements({ isVerified }: AnnouncementProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {!isVerified && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800 text-sm">Verify Your Account</h3>
          </div>
          <p className="mt-2 text-xs text-yellow-700">
            Complete KYC verification to enable withdrawals and higher limits.
          </p>
          <Link 
            href="/profile/verification"
            className="mt-2 inline-block text-sm text-red-500 hover:text-green-600"
          >
            Verify Now →
          </Link>
        </Card>
      )}
      
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center space-x-2">
          <Bell className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-blue-800 text-sm">New Features</h3>
        </div>
        <p className="mt-2 text-xs text-blue-700">
          Check out our new crypto trading features and improved security measures.
        </p>
      </Card>

      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <h3 className="font-semibold text-green-800 text-sm">Market Update</h3>
        </div>
        <p className="mt-2 text-xs text-green-700">
          Bitcoin hits new high! Check our latest market analysis.
        </p>
      </Card>
    </div>
  );
}