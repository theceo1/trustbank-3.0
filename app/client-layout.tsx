'use client';

import { Header } from "@/components/Header";
import Footer from '@/components/Footer';
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AdminProvider } from "./admin/context/AdminAuthContext";
import AnalyticsProvider from "@/app/components/PlausibleProvider";
import { usePathname } from "next/navigation";
import { AuthProvider } from "./context/AuthContext";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <SessionProvider>
      <Providers>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AdminProvider>
              <AnalyticsProvider>
                <div className="relative min-h-screen flex flex-col">
                  {!isAdminRoute && <Header />}
                  <main className="flex-grow">
                    {children}
                  </main>
                  {!isAdminRoute && <Footer />}
                  <Analytics />
                  <SpeedInsights />
                </div>
              </AnalyticsProvider>
            </AdminProvider>
          </AuthProvider>
        </ThemeProvider>
      </Providers>
    </SessionProvider>
  );
} 