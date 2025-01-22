"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ArrowDown, ArrowUp, ArrowRightLeft, TrendingUp } from "lucide-react";
import DepositModal from "./wallet/modals/DepositModal";
import WithdrawModal from "./wallet/modals/WithdrawModal";
import TransferModal from "./wallet/modals/TransferModal";

type WalletAction = 'deposit' | 'withdraw' | 'transfer' | 'trade';

interface WalletCardProps {
  wallet: {
    currency: string;
    balance: string;
    locked: string;
    percentageChange?: number;
  };
  onAction?: (action: WalletAction) => void;
}

export default function WalletCard({ wallet, onAction }: WalletCardProps) {
  const { currency, balance, locked, percentageChange } = wallet;
  const formattedBalance = formatCurrency(parseFloat(balance), currency);
  const formattedLocked = parseFloat(locked) > 0 ? formatCurrency(parseFloat(locked), currency) : null;
  const router = useRouter();
  
  const [activeModal, setActiveModal] = useState<WalletAction | null>(null);

  const handleAction = (action: WalletAction) => {
    if (onAction) {
      onAction(action);
      return;
    }

    if (action === 'trade') {
      router.push(`/trade/${currency.toLowerCase()}`);
      return;
    }

    setActiveModal(action);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="relative overflow-hidden bg-[#00A651]/5" data-testid={`wallet-card-${currency.toLowerCase()}`}>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold">{currency.toUpperCase()}</span>
                  {percentageChange !== undefined && (
                    <span className={`text-sm ${percentageChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {percentageChange >= 0 ? '+' : ''}{percentageChange}%
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{formattedBalance}</div>
                  {formattedLocked && (
                    <div className="text-sm text-muted-foreground">
                      {formattedLocked} locked
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                  onClick={() => handleAction('deposit')}
                >
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Deposit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                  onClick={() => handleAction('withdraw')}
                >
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Withdraw
                </Button>
                {currency.toLowerCase() !== 'ngn' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                      onClick={() => handleAction('transfer')}
                    >
                      <ArrowRightLeft className="mr-2 h-4 w-4" />
                      Transfer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
                      onClick={() => handleAction('trade')}
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Trade
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <DepositModal
        isOpen={activeModal === 'deposit'}
        onClose={handleCloseModal}
        currency={currency}
      />
      
      <WithdrawModal
        isOpen={activeModal === 'withdraw'}
        onClose={handleCloseModal}
        currency={currency}
        balance={parseFloat(balance)}
      />

      {currency.toLowerCase() !== 'ngn' && (
        <TransferModal
          isOpen={activeModal === 'transfer'}
          onClose={handleCloseModal}
          currency={currency}
          balance={parseFloat(balance)}
        />
      )}
    </>
  );
} 