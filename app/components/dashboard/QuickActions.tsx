"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Wallet, History, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="w-full justify-start space-x-2"
            onClick={() => router.push(action.href)}
          >
            <action.icon className="h-4 w-4" />
            <div className="flex flex-col items-start">
              <span>{action.label}</span>
              <span className="text-xs text-muted-foreground">{action.description}</span>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}