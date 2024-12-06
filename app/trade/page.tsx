//app/trade/page.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TradeForm } from './components/TradeForm';
import { MarketStats } from './components/MarketStats';
import { TradeHistory } from './components/TradeHistory';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { TradeType } from '@/app/types/trade';

export default function TradePage() {
  const { user } = useAuth();
  const [selectedAction, setSelectedAction] = useState<TradeType>('buy');

  return (
    <div className="container mx-auto py-8 px-4 space-y-6 mt-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Trade Crypto</CardTitle>
            <div className="flex space-x-2 mt-4">
              <Button 
                variant={selectedAction === 'buy' ? 'default' : 'outline'}
                onClick={() => setSelectedAction('buy')}
              >
                Buy
              </Button>
              <Button 
                variant={selectedAction === 'sell' ? 'default' : 'outline'}
                onClick={() => setSelectedAction('sell')}
              >
                Sell
              </Button>
              <Button 
                variant={selectedAction === 'swap' ? 'default' : 'outline'}
                onClick={() => setSelectedAction('swap')}
              >
                Swap
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TradeForm initialType={selectedAction} />
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <MarketStats />
        </div>
      </div>

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