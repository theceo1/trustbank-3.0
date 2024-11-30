"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface CoinData {
  id: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export default function MarketOverview({ itemsPerPage = 3 }) {
  const [marketData, setMarketData] = useState<CoinData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/market-data');
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        const data = await response.json();
        setMarketData(data);
      } catch (error) {
        console.error('Error fetching market data:', error);
        setError('Failed to load market data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {marketData.slice(0, itemsPerPage).map((coin) => (
              <li key={coin.id} className="flex justify-between items-center">
                <span>{coin.name}</span>
                <div>
                  <span className="mr-2">${coin.current_price.toLocaleString()}</span>
                  <span className={coin.price_change_percentage_24h > 0 ? "text-green-500" : "text-red-500"}>
                    {coin.price_change_percentage_24h > 0 ? "+" : ""}{coin.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
