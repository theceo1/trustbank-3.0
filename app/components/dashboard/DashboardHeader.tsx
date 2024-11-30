"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Shield, Bell, Settings } from "lucide-react";
import Link from "next/link";

interface DashboardHeaderProps {
  displayName: string;
  isVerified: boolean;
}

export default function DashboardHeader({ displayName, isVerified }: DashboardHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold mb-2 text-green-600">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground text-xs italic">
            Here&apos;s an overview of your financial activities
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {isVerified ? (
            <Badge variant="default" className="flex items-center gap-1 bg-green-600">
              <Shield className="h-3 w-3" />
              Verified
            </Badge>
          ) : (
            <Link href="/profile/verification">
              <Badge variant="destructive" className="flex items-center gap-1 cursor-pointer">
                <Shield className="h-3 w-3" />
                Verify Account
              </Badge>
            </Link>
          )}
          <Link href="/profile/notifications">
            <Bell className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
          </Link>
          <Link href="/profile/security">
            <Settings className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}