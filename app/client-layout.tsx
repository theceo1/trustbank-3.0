'use client';

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
} 