// app/admin/components/AdminSidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  LayoutDashboard,
  Users,
  Settings,
  CreditCard,
  LineChart,
  Share2,
  Shield,
  HelpCircle,
  MessageSquare,
  DollarSign
} from "lucide-react";

interface SidebarLink {
  title: string;
  href: string;
  icon: React.ReactNode;
  requiredPermission?: string;
}

const sidebarLinks: SidebarLink[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />,
    requiredPermission: "users:manage",
  },
  {
    title: "Transactions",
    href: "/admin/transactions",
    icon: <CreditCard className="h-5 w-5" />,
    requiredPermission: "transactions:view",
  },
  {
    title: "Revenue",
    href: "/admin/revenue",
    icon: <DollarSign className="h-5 w-5" />,
    requiredPermission: "reports:view",
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: <LineChart className="h-5 w-5" />,
    requiredPermission: "reports:view",
  },
  {
    title: "Referrals",
    href: "/admin/referrals",
    icon: <Share2 className="h-5 w-5" />,
  },
  {
    title: "Support",
    href: "/admin/support",
    icon: <MessageSquare className="h-5 w-5" />,
    requiredPermission: "support:handle",
  },
  {
    title: "Security",
    href: "/admin/security",
    icon: <Shield className="h-5 w-5" />,
    requiredPermission: "settings:manage",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: <Settings className="h-5 w-5" />,
    requiredPermission: "settings:manage",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { hasPermission } = useAdminAuth();

  const filteredLinks = sidebarLinks.filter(link => {
    if (!link.requiredPermission) return true;
    const [resource, action] = link.requiredPermission.split(':');
    return hasPermission(resource, action);
  });

  return (
    <div className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background">
      <ScrollArea className="h-full py-6">
        <div className="space-y-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              {filteredLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={pathname === link.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      pathname === link.href && "bg-muted"
                    )}
                  >
                    {link.icon}
                    <span className="ml-3">{link.title}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 left-0 right-0 px-3">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
          >
            <HelpCircle className="mr-3 h-5 w-5" />
            Help & Documentation
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}