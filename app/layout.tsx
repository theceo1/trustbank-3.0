// app/layout.tsx

import { Inter } from 'next/font/google';
import './globals.css';
import { metadata } from './metadata';
import { Providers } from './providers';
import ClientLayout from './client-layout';

const inter = Inter({ subsets: ['latin'] });

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
