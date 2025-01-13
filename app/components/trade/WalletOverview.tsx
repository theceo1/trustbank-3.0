"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Wallet {
  currency: string;
  balance: string;
  locked: string;
}

const CORE_CURRENCIES = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'XRP'];
const WALLETS_PER_PAGE = 4;

export default function WalletOverview() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await fetch('/api/wallet/balances');
      if (!response.ok) {
        throw new Error('Failed to fetch wallets');
      }
      const data = await response.json();
      
      // Filter and sort wallets
      const filteredWallets = data.data
        .filter((wallet: Wallet) => 
          CORE_CURRENCIES.includes(wallet.currency.toUpperCase()))
        .sort((a: Wallet, b: Wallet) => 
          CORE_CURRENCIES.indexOf(a.currency.toUpperCase()) - 
          CORE_CURRENCIES.indexOf(b.currency.toUpperCase()));
      
      setWallets(filteredWallets);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallets');
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(wallets.length / WALLETS_PER_PAGE);
  const currentWallets = wallets.slice(
    currentPage * WALLETS_PER_PAGE,
    (currentPage + 1) * WALLETS_PER_PAGE
  );

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  if (loading) {
    return <div className="text-center">Loading wallets...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Wallets</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevPage}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextPage}
              disabled={currentPage >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="grid grid-cols-2 gap-4"
            >
              {currentWallets.map((wallet: Wallet) => (
                <Card key={wallet.currency} className="bg-secondary/10">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{wallet.currency.toUpperCase()}</span>
                      <span className="text-sm text-muted-foreground">Available</span>
                    </div>
                    <div className="text-lg font-bold">
                      {parseFloat(wallet.balance).toFixed(8)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Locked: {parseFloat(wallet.locked).toFixed(8)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center mt-4 gap-1">
          {Array.from({ length: totalPages }).map((_, index) => (
            <Button
              key={index}
              variant={currentPage === index ? "default" : "outline"}
              size="icon"
              className="w-2 h-2 rounded-full p-0"
              onClick={() => setCurrentPage(index)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 