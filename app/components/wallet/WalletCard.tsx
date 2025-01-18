import { History, Loader2, AlertCircle, LinkIcon, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import WithdrawModal from "./modals/WithdrawModal";
import DepositModal from "./modals/DepositModal";
import TransferModal from "./modals/TransferModal";

interface WalletCardProps {
  currency: string;
  balance: number;
  percentageChange: number;
  isLoading?: boolean;
  onTrade: () => void;
  showTransfer?: boolean;
}

export default function WalletCard({
  currency,
  balance,
  percentageChange,
  isLoading = false,
  onTrade,
  showTransfer = false
}: WalletCardProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState<'deposit' | 'withdraw' | 'transfer' | null>(null);
  const isNGN = currency.toLowerCase() === 'ngn';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden" data-testid={`wallet-card-${currency.toLowerCase()}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {!isNGN && (
                <div className="relative w-8 h-8">
                  <img
                    src={`https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/${currency.toLowerCase()}.png`}
                    alt={currency}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/generic.png`;
                    }}
                  />
                </div>
              )}
              <h3 className="text-lg font-semibold">{currency.toUpperCase()}</h3>
            </div>
            {!isNGN && (
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm",
                  percentageChange > 0 ? "text-green-600" : "text-red-600"
                )}>
                  <TrendingUp className="h-4 w-4 inline-block mr-1" />
                  {Math.abs(percentageChange)}%
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading balance...</span>
              </div>
            ) : (
              <div className="text-2xl font-bold" data-testid="wallet-balance">
                {isNGN ? `₦${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
                  `${formatCurrency(balance)} ${currency.toUpperCase()}`}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="w-full hover:bg-green-50"
                onClick={() => setShowModal('deposit')}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Deposit
              </Button>
              <Button
                variant="outline"
                className="w-full hover:bg-green-50"
                onClick={() => setShowModal('withdraw')}
              >
                <History className="mr-2 h-4 w-4" />
                Withdraw
              </Button>
              {showTransfer && !isNGN && (
                <Button
                  variant="outline"
                  className="w-full hover:bg-green-50 col-span-2"
                  onClick={() => setShowModal('transfer')}
                  data-testid="transfer-button"
                >
                  <History className="mr-2 h-4 w-4" />
                  Transfer
                </Button>
              )}
            </div>

            {!isNGN && (
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={onTrade}
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                Trade {currency.toUpperCase()}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showModal === 'deposit' && (
        <DepositModal
          isOpen={showModal === 'deposit'}
          currency={currency}
          onClose={() => setShowModal(null)}
        />
      )}

      {showModal === 'withdraw' && (
        <WithdrawModal
          isOpen={showModal === 'withdraw'}
          currency={currency}
          balance={balance}
          onClose={() => setShowModal(null)}
        />
      )}

      {showModal === 'transfer' && (
        <TransferModal
          isOpen={showModal === 'transfer'}
          currency={currency}
          balance={balance}
          onClose={() => setShowModal(null)}
        />
      )}
    </motion.div>
  );
} 