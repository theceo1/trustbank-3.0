// app/admin/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth, AdminAuthProvider } from "./context/AdminAuthContext";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { AdminRoleGuard } from "./components/AdminRoleGuard";

// Auth pages that don't require admin check
const AUTH_PAGES = ['/admin/auth/login', '/admin/auth/signup'];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAdminAuth();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAdmin && !AUTH_PAGES.includes(pathname)) {
      toast({
        title: "Access Denied",
        description: "Admin privileges required",
        variant: "destructive"
      });
      // Only redirect if we're not already on an auth page
      if (!pathname.includes('/admin/auth/')) {
        router.push('/admin/auth/login');
      }
    }
  }, [isAdmin, isLoading, pathname, router, toast]);

  // Allow rendering of auth pages without admin check
  if (AUTH_PAGES.includes(pathname)) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAdmin && !AUTH_PAGES.includes(pathname)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex pt-16">
        <AdminSidebar />
        <main className="flex-1 ml-64 p-8">
          <AdminRoleGuard>{children}</AdminRoleGuard>
        </main>
      </div>
    </div>
  );
}