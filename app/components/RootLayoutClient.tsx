// app/components/RootLayoutClient.tsx

"use client";

import Header from '@/components/Header';
import Footer from '@/app/components/Footer';
import { AuthProvider } from '@/app/context/AuthContext';
import { Providers } from '../providers';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toast } from "@/components/ui/toast";
import { AdminProvider } from '../admin/context/AdminAuthContext';
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
      <Providers>
        <AuthProvider>
          <AdminProvider>
            <AnalyticsProvider>
              {!isAdminRoute && <Header />}
              {children}
              {!isAdminRoute && <Footer />}
              <Toast />
              <Analytics />
              <SpeedInsights />
            </AnalyticsProvider>
          </AdminProvider>
        </AuthProvider>
      </Providers>
    </Suspense>
  );
} 