"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  LayoutDashboard,
  Users,
  RefreshCcw,
  Settings,
  Shield,
  CreditCard,
  Bell,
  FileText,
  BarChart2,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    permission: { module: "dashboard", action: "read" }
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    permission: { module: "users", action: "read" }
  },
  {
    title: "Referrals",
    href: "/admin/referrals",
    icon: RefreshCcw,
    permission: { module: "referrals", action: "read" }
  },
  {
    title: "Transactions",
    href: "/admin/transactions",
    icon: CreditCard,
    permission: { module: "transactions", action: "read" }
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: FileText,
    permission: { module: "reports", action: "read" }
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart2,
    permission: { module: "analytics", action: "read" }
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    permission: { module: "notifications", action: "read" }
  },
  {
    title: "Admin Users",
    href: "/admin/admins",
    icon: Shield,
    permission: { module: "admin_users", action: "read" }
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    permission: { module: "settings", action: "read" }
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { hasPermission } = useAdminAuth();

  return (
    <div className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0 bottom-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Portal
        </h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => 
            hasPermission(item.permission.module, item.permission.action) && (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 dark:text-gray-400 transition-all hover:text-gray-900 dark:hover:text-white",
                    pathname === item.href && "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              </li>
            )
          )}
        </ul>
      </nav>
    </div>
  );
}