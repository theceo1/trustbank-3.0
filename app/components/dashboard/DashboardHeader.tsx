"use client";

import { Badge } from "@/components/ui/badge";
import { Shield, Bell, Settings } from "lucide-react";
import Link from "next/link";

interface DashboardHeaderProps {
  displayName: string;
  isVerified: boolean;
}

export default function DashboardHeader({ displayName, isVerified }: DashboardHeaderProps) {
  // Get first name only
  const firstName = displayName.split(' ')[0];

  return (
    <div className="mb-8 p-4 md:p-6 bg-orange-100 dark:bg-orange-900/20 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-0 md:justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-green-600 dark:text-green-400">
            Welcome back, {firstName}
          </h1>
          <p className="text-muted-foreground text-sm italic">
            Here&apos;s an overview of your financial activities
          </p>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          {isVerified ? (
            <Badge variant="default" className="flex items-center gap-1 bg-green-600 py-1.5 whitespace-nowrap">
              <Shield className="h-3.5 w-3.5" />
              Verified
            </Badge>
          ) : (
            <Link href="/profile/verification">
              <Badge variant="destructive" className="flex items-center gap-1 cursor-pointer py-1.5 whitespace-nowrap">
                <Shield className="h-3.5 w-3.5" />
                Verify Account
              </Badge>
            </Link>
          )}
          <div className="flex items-center gap-2">
            <Link href="/profile/notifications" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground hover:text-primary" />
            </Link>
            <Link href="/profile/security" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <Settings className="h-5 w-5 text-muted-foreground hover:text-primary" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}