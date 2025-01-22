"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Bell } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import DepositModal from "./modals/DepositModal";
import WithdrawModal from "./modals/WithdrawModal";
import TransferModal from "./modals/TransferModal";
import PriceAlertModal from "./modals/PriceAlertModal";
import PriceChart from "./PriceChart";
import { createPortal } from "react-dom";
import { CryptoIcons } from "@/app/components/icons/CryptoIcons";

interface WalletCardProps {
  currency: string;
  balance: number;
  locked: number;
  isFavorite?: boolean;
  onToggleFavorite?: (currency: string) => void;
}

interface ChartDataPoint {
  time: string;
  value: number;
}

export default function WalletCard({
  currency,
  balance,
  locked,
  isFavorite = false,
  onToggleFavorite,
}: WalletCardProps) {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showPriceAlertModal, setShowPriceAlertModal] = useState(false);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0); // Initialize with 0
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      if (currency.toLowerCase() === 'ngn') return;
      
      try {
        setIsLoadingChart(true);
        const response = await fetch(`/api/market/history?market=${currency.toLowerCase()}ngn&period=24h`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('Chart data fetch error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          throw new Error(errorData?.message || `Failed to fetch chart data: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.status !== 'success' || !Array.isArray(data.data)) {
          console.error('Invalid chart data format:', data);
          throw new Error('Invalid chart data format received');
        }
        
        if (data.data.length === 0) {
          console.warn('No chart data available for', currency);
          return;
        }

        setChartData(data.data);
        // Set current price from the last data point
        if (data.data.length > 0) {
          setCurrentPrice(data.data[data.data.length - 1].value);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
        // Don't set error state to avoid showing error UI for chart issues
        // The rest of the wallet card can still be functional
      } finally {
        setIsLoadingChart(false);
      }
    };

    fetchChartData();
    // Set up polling interval
    const interval = setInterval(fetchChartData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [currency]);

  const handleFavoriteClick = () => {
    if (onToggleFavorite) {
      onToggleFavorite(currency);
    }
  };

  return (
    <>
      <Card className={`relative overflow-hidden ${
        currency.toLowerCase() === 'ngn' 
          ? 'bg-orange-50 dark:bg-orange-900/50 dark:text-white' 
          : 'bg-green-600/5'
      }`}>
        <div className="p-6">
          {/* Favorite and Alert Buttons */}
          <div className="absolute top-2 right-2 flex gap-2">
            {currency.toLowerCase() !== 'ngn' && (
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-transparent"
                onClick={() => setShowPriceAlertModal(true)}
              >
                <Bell className="h-5 w-5 text-muted-foreground hover:text-green-600" />
              </Button>
            )}
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-transparent"
                onClick={handleFavoriteClick}
              >
                <Star className={`h-5 w-5 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
              </Button>
            )}
          </div>

          {/* Currency Info */}
          <div className="flex items-center space-x-3 mb-4">
            {currency.toLowerCase() !== 'ngn' && (
              <div className="relative w-8 h-8">
                {CryptoIcons[currency.toUpperCase() as keyof typeof CryptoIcons] ? (
                  <div className="w-8 h-8">
                    {CryptoIcons[currency.toUpperCase() as keyof typeof CryptoIcons]()}
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">{currency.toUpperCase().slice(0, 3)}</span>
                  </div>
                )}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold dark:text-white">{currency.toUpperCase()}</h3>
              <p className="text-sm text-muted-foreground dark:text-gray-300">Available Balance</p>
            </div>
          </div>

          {/* Balance */}
          <div className="space-y-1">
            <div className="text-2xl font-bold dark:text-white">
              {formatCurrency(balance, currency)}
            </div>
            {locked > 0 && (
              <div className="text-sm text-muted-foreground dark:text-gray-300">
                {formatCurrency(locked, currency)} locked
              </div>
            )}
          </div>

          {/* Price Chart */}
          {currency.toLowerCase() !== 'ngn' && chartData.length > 0 && (
            <div className="mt-4 -mx-6">
              <PriceChart data={chartData} containerClassName="w-full" />
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDepositModal(true)}
              className="hover:bg-green-50 dark:hover:bg-green-900 hover:text-green-600 dark:text-white dark:hover:text-green-400 transition-colors"
            >
              Deposit
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowWithdrawModal(true)}
              className="hover:bg-green-50 dark:hover:bg-green-900 hover:text-green-600 dark:text-white dark:hover:text-green-400 transition-colors"
            >
              Withdraw
            </Button>
            {currency.toLowerCase() !== 'ngn' && (
              <Button
                variant="outline"
                onClick={() => setShowTransferModal(true)}
                className="hover:bg-green-50 dark:hover:bg-green-900 hover:text-green-600 dark:text-white dark:hover:text-green-400 transition-colors"
              >
                Transfer
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Render modals in a portal */}
      {mounted && createPortal(
        <div className="relative z-50">
          <DepositModal
            isOpen={showDepositModal}
            onClose={() => setShowDepositModal(false)}
            currency={currency}
          />
          <WithdrawModal
            isOpen={showWithdrawModal}
            onClose={() => setShowWithdrawModal(false)}
            currency={currency}
            balance={balance}
          />
          <TransferModal
            isOpen={showTransferModal}
            onClose={() => setShowTransferModal(false)}
            currency={currency}
            balance={balance}
          />
          <PriceAlertModal
            isOpen={showPriceAlertModal}
            onClose={() => setShowPriceAlertModal(false)}
            currency={currency}
            currentPrice={currentPrice} // Now currentPrice is always a number
          />
        </div>,
        document.body
      )}
    </>
  );
}