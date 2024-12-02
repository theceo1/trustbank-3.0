"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/components/theme-provider';
import { Providers } from '../providers';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from "@/components/ui/toast";
import { AdminAuthProvider } from '../admin/context/AdminAuthContext';
import AnalyticsProvider from '@/app/components/PlausibleProvider';
import { usePathname } from 'next/navigation';

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <AnalyticsProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Providers>
          <AuthProvider>
            <AdminAuthProvider>
              {!isAdminRoute && <Header />}
              {children}
              {!isAdminRoute && <Footer />}
            </AdminAuthProvider>
          </AuthProvider>
        </Providers>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </ThemeProvider>
    </AnalyticsProvider>
  );
} 