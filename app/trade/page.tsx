//app/trade/page.tsx
"use client";

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import MarketStats from '@/app/components/trade/MarketStats';
import { TradeHistory } from '@/app/components/trade/TradeHistory';
import TradeForm from '@/app/components/trade/TradeForm';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function TradePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/trade');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6 mt-12">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Please sign in to access the trading page
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6 mt-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Trade Crypto</CardTitle>
          </CardHeader>
          <CardContent>
            <TradeForm />
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <MarketStats />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          <TradeHistory />
        </CardContent>
      </Card>
    </div>
  );
}