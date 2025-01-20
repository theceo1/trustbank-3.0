"use client";

import { History, Loader2, AlertCircle, LinkIcon, TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import WithdrawModal from "@/app/components/wallet/modals/WithdrawModal";
import DepositModal from "@/app/components/wallet/modals/DepositModal";
import TransferModal from "@/app/components/wallet/modals/TransferModal";

export type WalletAction = 'deposit' | 'withdraw' | 'trade' | 'transfer';

interface WalletData {
  currency: string;
  balance: string;
  locked: string;
  percentageChange: number;
}

interface WalletCardProps {
  wallet: WalletData;
  onAction?: (action: WalletAction) => void;
}

export default function WalletCard({ wallet, onAction }: WalletCardProps) {
  const { currency, balance, locked, percentageChange } = wallet;
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
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="relative overflow-hidden bg-[#00A651]/5" data-testid={`wallet-card-${currency.toLowerCase()}`}>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold">{currency}</div>
                  {percentageChange !== 0 && (
                    <span className={`text-sm ${percentageChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {percentageChange > 0 ? '+' : ''}{percentageChange}%
                    </span>
                  )}
                </div>
              </div>

              <div className="text-3xl font-bold tracking-tight">
                {formattedBalance}
              </div>

              {formattedLocked && (
                <div className="text-sm text-muted-foreground">
                  Locked: {formattedLocked}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 hover:bg-[#00A651] hover:text-white transition-colors"
                  onClick={() => setShowDepositModal(true)}
                >
                  <ArrowDownLeft className="h-4 w-4 mr-1" />
                  Deposit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 hover:bg-[#00A651] hover:text-white transition-colors"
                  onClick={() => setShowWithdrawModal(true)}
                >
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  Withdraw
                </Button>
                {currency.toLowerCase() !== 'ngn' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-[#00A651] hover:text-white transition-colors"
                    onClick={() => setShowTransferModal(true)}
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
    </>
  );
} 