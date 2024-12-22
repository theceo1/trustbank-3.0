// app/components/RootLayoutClient.tsx

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
import { Suspense } from 'react';

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <Suspense fallback={null}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Providers>
          <AuthProvider>
            <AdminAuthProvider>
              <AnalyticsProvider>
                {!isAdminRoute && <Header />}
                {children}
                {!isAdminRoute && <Footer />}
                <Toaster />
                <Analytics />
                <SpeedInsights />
              </AnalyticsProvider>
            </AdminAuthProvider>
          </AuthProvider>
        </Providers>
      </ThemeProvider>
    </Suspense>
  );
} 