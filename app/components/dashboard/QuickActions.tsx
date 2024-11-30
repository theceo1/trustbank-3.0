"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowUpRight, Wallet, User, Shield, History } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Trade Now",
      href: "/trade",
      icon: <ArrowUpRight className="h-5 w-5" />,
      color: "bg-green-600"
    },
    {
      title: "Deposit",
      href: "/profile/wallet",
      icon: <Wallet className="h-5 w-5" />,
      color: "bg-blue-600"
    },
    {
      title: "Profile",
      href: "/profile",
      icon: <User className="h-5 w-5" />,
      color: "bg-purple-600"
    },
    {
      title: "History",
      href: "/history",
      icon: <History className="h-5 w-5" />,
      color: "bg-orange-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={action.href}>
              <div className={`p-4 rounded-lg ${action.color} text-white hover:opacity-90 transition-opacity cursor-pointer`}>
                <div className="flex items-center space-x-2">
                  {action.icon}
                  <span>{action.title}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}