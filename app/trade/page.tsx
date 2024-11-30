"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TradeForm } from './components/TradeForm';
import { MarketStats } from './components/MarketStats';
import { TradeHistory } from './components/TradeHistory';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsTrigger } from "@/components/ui/tabs"

export default function TradePage() {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-8 px-4 space-y-6 mt-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Trade Form */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Trade Crypto</CardTitle>
          </CardHeader>
          <CardContent>
            <TradeForm />
          </CardContent>
        </Card>

        {/* Market Stats */}
        <div className="md:col-span-2">
          <MarketStats />
        </div>
      </div>

      {/* Trade History */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Trade History</CardTitle>
          </CardHeader>
          <CardContent>
            <TradeHistory trades={[]} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
