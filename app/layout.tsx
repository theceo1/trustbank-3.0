// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/components/theme-provider';
import { Providers } from './providers';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from "@/components/ui/toaster";
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import AnalyticsProvider from '@/app/components/PlausibleProvider';
import { ToastProvider } from "@/app/context/ToastContext";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'trustBank',
  description: 'Your trusted cryptocurrency exchange',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" 
        />
        <script defer data-domain="trustbank.tech" src="https://plausible.io/js/script.tagged-events.js" />
      </head>
      <body className={inter.className}>
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
                  <Header />
                  <ToastProvider>
                    {children}
                  </ToastProvider>
                  <Footer />
                </AdminAuthProvider>
              </AuthProvider>
            </Providers>
            <Toaster />
          </ThemeProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
