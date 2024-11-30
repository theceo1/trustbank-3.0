"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity, BarChart2, DollarSign, Coins } from "lucide-react";
import { useCryptoWebSocket } from "@/hooks/use-crypto-websocket";
import { MarketStatCard } from "@/app/components/market/MarketStatCard";
import { CryptoList } from "@/app/components/market/CryptoList";
import { TimeframeSelector } from "@/app/components/market/TimeframeSelector";
import { CurrencySelector } from "@/app/components/market/CurrencySelector";
import { CryptoData } from "@/app/types/market";
import { Card } from "@/components/ui/card";

const AVAILABLE_CURRENCIES = [
  { id: 'BTC', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH' },
  { id: 'USDT', name: 'Tether', symbol: 'USDT' },
  { id: 'USDC', name: 'USD Coin', symbol: 'USDC' },
];

const TIMEFRAMES = ['1H', '24H', '7D', '30D', 'ALL'];

interface MarketStats {
  totalMarketCap: number;
  totalVolume: number;
  btcDominance: number;
  marketCapChange: number;
}

export default function MarketPage() {
  const [marketStats, setMarketStats] = useState<MarketStats>({
    totalMarketCap: 0,
    totalVolume: 0,
    btcDominance: 0,
    marketCapChange: 0
  });
  const [selectedCrypto, setSelectedCrypto] = useState<string>("BTC");
  const [activeTimeframe, setActiveTimeframe] = useState<string>("24H");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingCryptoList, setIsLoadingCryptoList] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const { prices, isConnected } = useCryptoWebSocket();

  useEffect(() => {
    const fetchCryptoData = async () => {
      setIsLoadingCryptoList(true);
      setError(null);
      try {
        const response = await fetch('/api/crypto/list');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch crypto data');
        }
        const data = await response.json();
        setCryptoData(data);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch crypto data');
      } finally {
        setIsLoadingCryptoList(false);
      }
    };

    fetchCryptoData();
  }, []);

  useEffect(() => {
    const fetchMarketStats = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/global');
        if (!response.ok) throw new Error('Failed to fetch market stats');
        const { data } = await response.json();
        
        setMarketStats({
          totalMarketCap: data.total_market_cap.usd,
          totalVolume: data.total_volume.usd,
          btcDominance: data.market_cap_percentage.btc,
          marketCapChange: data.market_cap_change_percentage_24h_usd
        });
      } catch (error) {
        console.error('Error fetching market stats:', error);
      }
    };

    fetchMarketStats();
    const interval = setInterval(fetchMarketStats, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (prices[`${selectedCrypto}USDT`]) {
      const newPrice = prices[`${selectedCrypto}USDT`];
      setCurrentPrice(newPrice);
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }));
      setIsLoading(false);
    }
  }, [prices, selectedCrypto]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-12 mt-16">
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Market Overview</h2>
          <p className="text-muted-foreground">Real-time cryptocurrency market statistics and trends</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MarketStatCard
            title="Total Market Cap"
            value={marketStats.totalMarketCap ? `$${(marketStats.totalMarketCap / 1e12).toFixed(2)}T` : 'Loading...'}
            icon={<Activity className="h-4 w-4" />}
          />
          <MarketStatCard
            title="24h Trading Volume"
            value={marketStats.totalVolume ? `$${(marketStats.totalVolume / 1e9).toFixed(2)}B` : 'Loading...'}
            icon={<BarChart2 className="h-4 w-4" />}
          />
          <MarketStatCard
            title="Active Markets"
            value="500+"
            icon={<Coins className="h-4 w-4" />}
          />
        </div>
      </section>

      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Price Tracker</h2>
          <p className="text-muted-foreground">Monitor real-time cryptocurrency prices</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Select Currency</h3>
              <CurrencySelector
                selected={selectedCrypto}
                onSelect={setSelectedCrypto}
                currencies={AVAILABLE_CURRENCIES.map(currency => currency.id)}
              />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Time Frame</h3>
              <TimeframeSelector
                selectedTimeframe={activeTimeframe}
                onTimeframeChange={setActiveTimeframe}
                timeframes={TIMEFRAMES}
              />
            </div>
          </div>

          <Card className="p-6 lg:col-span-3">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{selectedCrypto}/USDT</h2>
                <span className={`px-2 py-1 rounded-full text-sm ${isConnected ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                  {isConnected ? 'Live' : 'Connecting...'}
                </span>
              </div>
              <p className="text-5xl font-bold tracking-tight">
                {isLoading ? 'Loading...' : `$${currentPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {lastUpdated ? `Last updated: ${lastUpdated}` : 'Not available'}
              </p>
            </div>
          </Card>
        </div>
      </section>

      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Top Cryptocurrencies</h2>
          <p className="text-muted-foreground">Live prices and market cap rankings of major cryptocurrencies</p>
        </div>
        {error ? (
          <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-center">
            {error}
          </div>
        ) : (
          <CryptoList
            data={cryptoData}
            isLoading={isLoadingCryptoList}
          />
        )}
      </section>
    </div>
  );
}
