//app/trade/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QuickTrade } from './components/QuickTrade';
import { MarketStats } from './components/MarketStats';
import OrderBook from './components/OrderBook';
import { toast } from "sonner";
import { ErrorBoundary } from '@/app/components/error-boundary';
import { TradeHistory } from './components/TradeHistory';
import TradePreview from './components/TradePreview';
import TradeReceipt from './components/TradeReceipt';
import WebSocketService, { WebSocketEvent } from '@/app/lib/services/websocket';
import { TradeDetails } from '@/app/types/trade';

export default function TradePage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [hasQuidaxId, setHasQuidaxId] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [trades, setTrades] = useState<TradeDetails[]>([]);
  const [showTradePreview, setShowTradePreview] = useState(false);
  const [showTradeReceipt, setShowTradeReceipt] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<TradeDetails | null>(null);

  useEffect(() => {
    const ws = WebSocketService.getInstance();
    
    // Connect to WebSocket
    ws.connect('wss://ws.quidax.com');
    
    // Subscribe to market updates
    ws.subscribe('market_data');
    ws.subscribe('trades');
    
    // Handle connection state
    ws.on(WebSocketEvent.CONNECTION_STATE, (isConnected) => {
      setIsOffline(!isConnected);
      if (!isConnected) {
        toast.error('Lost connection to server', {
          description: 'Attempting to reconnect...'
        });
      } else {
        toast.success('Connected to server');
      }
    });
    
    // Handle trade updates
    ws.on(WebSocketEvent.TRADE_UPDATE, (trade: TradeDetails) => {
      setTrades(prev => [trade, ...prev].slice(0, 50)); // Keep last 50 trades
    });
    
    return () => {
      ws.unsubscribe('market_data');
      ws.unsubscribe('trades');
      ws.disconnect();
    };
  }, []);

  useEffect(() => {
    const checkUserSetup = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('is_verified, quidax_id')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return;
        }

        setIsVerified(profile?.is_verified || false);
        setHasQuidaxId(!!profile?.quidax_id);
      } catch (error) {
        console.error('Error checking user setup:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSetup();
  }, [user, supabase]);

  const handleTradePreview = (trade: TradeDetails) => {
    setSelectedTrade(trade);
    setShowTradePreview(true);
  };

  const handleTradeConfirm = () => {
    setShowTradePreview(false);
    setShowTradeReceipt(true);
  };

  const handleTradeClose = () => {
    setShowTradePreview(false);
    setShowTradeReceipt(false);
    setSelectedTrade(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[400px] rounded-lg" />
          <Skeleton className="h-[400px] lg:col-span-2 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <Card className="max-w-md mx-auto bg-white dark:bg-gray-800/50 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-center dark:text-white">Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground dark:text-gray-400 mb-4">
              Please sign in to access the trading features.
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
            >
              Sign In
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8 space-y-8 mt-16">
        {isOffline && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              You are currently offline. Some features may be unavailable.
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Trade & Wallet Balance */}
          <div className="lg:col-span-1 space-y-8">
            <ErrorBoundary>
              <QuickTrade onTradePreview={handleTradePreview} />
            </ErrorBoundary>
          </div>

          {/* Right Column - Market Stats & Order Book */}
          <div className="lg:col-span-2 space-y-8">
            <ErrorBoundary>
              <MarketStats />
            </ErrorBoundary>
            <ErrorBoundary>
              <OrderBook />
            </ErrorBoundary>
          </div>
        </div>

        {/* Trade History Section */}
        <ErrorBoundary>
          <Card className="bg-white dark:bg-gray-800/50 border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold dark:text-white">Trade History</CardTitle>
            </CardHeader>
            <CardContent>
              <TradeHistory trades={trades} onTradeSelect={handleTradePreview} />
            </CardContent>
          </Card>
        </ErrorBoundary>

        {/* Trade Preview Modal */}
        {showTradePreview && selectedTrade && (
          <TradePreview
            trade={selectedTrade}
            onConfirm={handleTradeConfirm}
            onClose={handleTradeClose}
          />
        )}

        {/* Trade Receipt Modal */}
        {showTradeReceipt && selectedTrade && (
          <TradeReceipt
            trade={selectedTrade}
            onClose={handleTradeClose}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}