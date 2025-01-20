"use client";

import { History, Loader2, AlertCircle, LinkIcon, TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Star, StarOff, Eye, EyeOff, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import WithdrawModal from "./modals/WithdrawModal";
import DepositModal from "./modals/DepositModal";
import TransferModal from "./modals/TransferModal";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LineChart, Line } from "recharts";

export type WalletAction = 'deposit' | 'withdraw' | 'trade' | 'transfer';

interface WalletData {
  currency: string;
  balance: string;
  locked: string;
  percentageChange: number;
  priceHistory?: { price: number; timestamp: string }[];
}

interface WalletCardProps {
  wallet: WalletData;
  onAction?: (action: WalletAction) => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

type SupportedCurrency = 'btc' | 'eth' | 'usdt' | 'usdc' | 'bnb' | 'ngn';

const getCurrencyIconUrl = (currency: string) => {
  const currencyMap: { [key: string]: string } = {
    btc: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    eth: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    usdt: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    usdc: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    bnb: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  };
  return currencyMap[currency.toLowerCase()] || 'https://cryptologos.cc/logos/question-mark.png';
};

export default function WalletCard({ wallet, onAction, onToggleFavorite, isFavorite = false }: WalletCardProps) {
  const { currency, balance, locked, percentageChange, priceHistory = [] } = wallet;
  const formattedBalance = formatCurrency(parseFloat(balance), currency);
  const formattedLocked = parseFloat(locked) > 0 ? formatCurrency(parseFloat(locked), currency) : null;
  const router = useRouter();
  
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const handleAction = (action: WalletAction) => {
    if (onAction) {
      onAction(action);
      return;
    }

    switch (action) {
      case 'deposit':
        setShowDepositModal(true);
        break;
      case 'withdraw':
        setShowWithdrawModal(true);
        break;
      case 'transfer':
        setShowTransferModal(true);
        break;
      case 'trade':
        router.push(`/trade/${currency.toLowerCase()}`);
        break;
    }
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card 
          className={cn(
            "relative overflow-hidden hover:shadow-lg transition-all duration-300",
            currency.toLowerCase() === 'ngn' 
              ? "bg-orange-100 dark:bg-orange-900/20" 
              : "bg-[#00A651]/5 dark:bg-[#00A651]/10"
          )} 
          data-testid={`wallet-card-${currency.toLowerCase()}`}
        >
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {currency.toLowerCase() !== 'ngn' && (
                    <div className="relative w-8 h-8">
                      <Image
                        src={getCurrencyIconUrl(currency)}
                        alt={currency}
                        width={32}
                        height={32}
                        className="rounded-full"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="text-2xl font-bold dark:text-white">{currency}</div>
                  {percentageChange !== 0 && (
                    <span className={`text-sm ${percentageChange > 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                      {percentageChange > 0 ? '+' : ''}{percentageChange}%
                    </span>
                  )}
                </div>
                {onToggleFavorite && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleFavorite}
                    className={cn(
                      "hover:text-[#00A651]/80",
                      currency.toLowerCase() === 'ngn' ? "text-orange-500" : "text-[#00A651]"
                    )}
                  >
                    {isFavorite ? <Star className="h-5 w-5 fill-current" /> : <StarOff className="h-5 w-5" />}
                  </Button>
                )}
              </div>

              <div className="text-3xl font-bold tracking-tight dark:text-white">
                {formattedBalance}
              </div>

              {formattedLocked && (
                <div className="text-sm text-muted-foreground dark:text-muted-foreground/80">
                  Locked: {formattedLocked}
                </div>
              )}

              {priceHistory && priceHistory.length > 0 && (
                <div className="h-12 w-full">
                  <LineChart width={200} height={48} data={priceHistory}>
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke={currency.toLowerCase() === 'ngn' ? "#f97316" : "#00A651"}
                      strokeWidth={1}
                      dot={false}
                    />
                  </LineChart>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex-1 transition-colors",
                    currency.toLowerCase() === 'ngn'
                      ? "hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500/80"
                      : "hover:bg-[#00A651] hover:text-white dark:hover:bg-[#00A651]/80"
                  )}
                  onClick={() => handleAction('deposit')}
                >
                  <ArrowDownLeft className="h-4 w-4 mr-1" />
                  Deposit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex-1 transition-colors",
                    currency.toLowerCase() === 'ngn'
                      ? "hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500/80"
                      : "hover:bg-[#00A651] hover:text-white dark:hover:bg-[#00A651]/80"
                  )}
                  onClick={() => handleAction('withdraw')}
                >
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  Withdraw
                </Button>
                {currency.toLowerCase() !== 'ngn' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-[#00A651] hover:text-white dark:hover:bg-[#00A651]/80 dark:hover:text-white transition-colors"
                    onClick={() => handleAction('transfer')}
                  >
                    <ArrowRightLeft className="h-4 w-4 mr-1" />
                    Transfer
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        currency={currency}
      />
      
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        currency={currency}
        balance={parseFloat(balance)}
      />

      {currency.toLowerCase() !== 'ngn' && (
        <TransferModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          currency={currency}
          balance={parseFloat(balance)}
        />
      )}
    </TooltipProvider>
  );
} 