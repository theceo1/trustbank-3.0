"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Wallet, History, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  const router = useRouter();

  const actions = [
    {
      label: "Trade",
      icon: ArrowUpDown,
      href: "/trade",
      description: "Buy and sell cryptocurrencies"
    },
    {
      label: "Manage Funds",
      icon: Wallet,
      href: "/wallet",
      description: "Deposit and withdraw funds"
    },
    {
      label: "Transaction History",
      icon: History,
      href: "/transactions",
      description: "View your transaction history"
    },
    {
      label: "Account Settings",
      icon: Settings,
      href: "/settings",
      description: "Manage your account settings"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("hover:shadow-lg transition-shadow duration-300", className)}>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {actions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Button
                variant="outline"
                className="w-full justify-start space-x-2 hover:bg-green-600 hover:text-white dark:hover:text-white transition-colors duration-200"
                onClick={() => router.push(action.href)}
              >
                <action.icon className="h-4 w-4" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{action.label}</span>
                  <span className="text-xs text-muted-foreground">{action.description}</span>
                </div>
              </Button>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}