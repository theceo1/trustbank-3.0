'use client';

import { Header } from "@/components/Header";
import Footer from '@/components/Footer';
import { AdminProvider } from "./admin/context/AdminAuthContext";
import AnalyticsProvider from "@/app/components/PlausibleProvider";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/app/context/AuthContext";
import { Providers } from "./providers";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <Providers>
      <AuthProvider>
        <AdminProvider>
          <AnalyticsProvider>
            <div className="relative min-h-screen flex flex-col">
              {!isAdminRoute && <Header />}
              <main className="flex-grow relative">
                {children}
              </main>
              {!isAdminRoute && <Footer />}
            </div>
          </AnalyticsProvider>
        </AdminProvider>
      </AuthProvider>
    </Providers>
  );
} 