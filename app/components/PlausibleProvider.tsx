"use client";

import PlausibleProvider from 'next-plausible';

export default function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PlausibleProvider 
      domain="trustbank.tech"
      enabled={process.env.NODE_ENV === 'production'}
      trackOutboundLinks
      trackFileDownloads
      taggedEvents
    >
      {children}
    </PlausibleProvider>
  );
}