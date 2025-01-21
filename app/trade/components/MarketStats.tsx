"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createChart, ColorType, LineStyle, Time } from 'lightweight-charts';
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber } from '@/app/lib/utils';
import { ArrowUp, ArrowDown, Activity } from 'lucide-react';

interface MarketData {
  price: number;
  volume: number;
  timestamp: number;
}

interface ChartData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface VolumeData {
  time: Time;
  value: number;
  color: string;
}

const TIMEFRAMES = [
  { label: '1H', value: '1h' },
  { label: '24H', value: '24h' },
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' }
];

export function MarketStats() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('24h');
  const [selectedMarket, setSelectedMarket] = useState<string>('btcngn');
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [stats, setStats] = useState({
    currentPrice: 0,
    high24h: 0,
    low24h: 0,
    volume24h: 0,
    priceChange24h: 0
  });

  const fetchMarketData = useCallback(async (timeframe: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/market/history?timeframe=${timeframe}&market=btcusdt`);
      if (!response.ok) throw new Error('Failed to fetch market data');
      
      const data = await response.json();
      setMarketData(data.data);
      
      // Calculate stats
      if (data.data.length > 0) {
        const latest = data.data[data.data.length - 1];
        const first = data.data[0];
        const prices = data.data.map((d: MarketData) => d.price);
        
        setStats({
          currentPrice: latest.price,
          high24h: Math.max(...prices),
          low24h: Math.min(...prices),
          volume24h: data.data.reduce((acc: number, curr: MarketData) => acc + curr.volume, 0),
          priceChange24h: ((latest.price - first.price) / first.price) * 100
        });
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketData(selectedTimeframe);
    
    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket('wss://www.quidax.com/api/v2/ranger');
    
    ws.onopen = () => {
      // Subscribe to market data
      ws.send(JSON.stringify({ 
        event: 'subscribe', 
        streams: [`${selectedMarket}.trades`]
      }));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.trades) {
          const latestTrade = data.trades[0];
          setStats(prev => ({
            ...prev,
            currentPrice: parseFloat(latestTrade.price),
            high24h: Math.max(prev.high24h, parseFloat(latestTrade.price)),
            low24h: Math.min(prev.low24h, parseFloat(latestTrade.price)),
            volume24h: prev.volume24h + parseFloat(latestTrade.volume)
          }));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [selectedTimeframe, selectedMarket]);

  const renderPriceChart = useCallback((container: HTMLDivElement) => {
    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#999',
      },
      grid: {
        vertLines: { color: '#2c2c34' },
        horzLines: { color: '#2c2c34' },
      },
      width: container.clientWidth,
      height: 300,
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#6b7280',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: ''
    });

    // Transform market data for the chart
    const chartData: ChartData[] = marketData.map(d => ({
      time: d.timestamp as Time,
      open: d.price,
      high: d.price * 1.001, // Simulated for demo
      low: d.price * 0.999,  // Simulated for demo
      close: d.price
    }));

    const volumeData: VolumeData[] = marketData.map(d => ({
      time: d.timestamp as Time,
      value: d.volume,
      color: d.price > marketData[0].price ? '#22c55e80' : '#ef444480'
    }));

    candlestickSeries.setData(chartData);
    volumeSeries.setData(volumeData);

    const handleResize = () => {
      chart.applyOptions({ width: container.clientWidth });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [marketData]);

  return (
    <Card className="bg-white dark:bg-gray-800/50 border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold dark:text-white">Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Price Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">Current Price</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold dark:text-white">
                  {formatCurrency(stats.currentPrice)}
                </span>
                <span className={`flex items-center text-sm ${stats.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.priceChange24h >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  {Math.abs(stats.priceChange24h).toFixed(2)}%
                </span>
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">24h High</span>
              <div className="text-2xl font-bold dark:text-white">
                {formatCurrency(stats.high24h)}
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">24h Low</span>
              <div className="text-2xl font-bold dark:text-white">
                {formatCurrency(stats.low24h)}
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">24h Volume</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold dark:text-white">
                  {formatNumber(stats.volume24h)}
                </span>
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Chart */}
          <Tabs value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <TabsList className="mb-4">
              {TIMEFRAMES.map((tf) => (
                <TabsTrigger
                  key={tf.value}
                  value={tf.value}
                  className="min-w-[60px]"
                >
                  {tf.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="h-[300px] w-full">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <div ref={renderPriceChart} className="h-full w-full" />
              )}
            </div>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}