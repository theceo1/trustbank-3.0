"use client";

import { Badge } from "@/components/ui/badge";
import { Shield, Bell, Settings } from "lucide-react";
import Link from "next/link";

interface DashboardHeaderProps {
  displayName: string;
  isVerified: boolean;
}

export default function DashboardHeader({ displayName, isVerified }: DashboardHeaderProps) {
  return (
    <div className="mb-8 p-6 bg-orange-100 rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold mb-2 text-green-600">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground text-sm italic">
            Here&apos;s an overview of your financial activities
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {isVerified ? (
            <Badge variant="default" className="flex items-center gap-1 bg-green-600 py-1.5">
              <Shield className="h-3.5 w-3.5" />
              Verified
            </Badge>
          ) : (
            <Link href="/profile/verification">
              <Badge variant="destructive" className="flex items-center gap-1 cursor-pointer py-1.5">
                <Shield className="h-3.5 w-3.5" />
                Verify Account
              </Badge>
            </Link>
          )}
          <Link href="/profile/notifications" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="h-5 w-5 text-muted-foreground hover:text-primary" />
          </Link>
          <Link href="/profile/security" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Settings className="h-5 w-5 text-muted-foreground hover:text-primary" />
          </Link>
        </div>
      </div>
    </div>
  );
}