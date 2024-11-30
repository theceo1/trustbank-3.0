import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency } from '@/lib/utils';
import { TradeDetails } from '@/app/types/trade';
import { TrustBankLogo } from '../brand/TrustBankLogo';
import { QRCode } from '../ui/qr-code';

interface TransactionReceiptProps {
  trade: TradeDetails;
  onDownload: () => void;
}

export function TransactionReceipt({ trade, onDownload }: TransactionReceiptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-md mx-auto bg-white p-6 space-y-6">
        <div className="flex justify-between items-center">
          <TrustBankLogo className="h-8" />
          <div className="text-right">
            <p className="text-sm text-gray-500">Transaction Receipt</p>
            <p className="text-sm font-medium">{trade.reference}</p>
          </div>
        </div>

        <div className="space-y-4 border-t border-b py-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Date</span>
            <span>{formatDate(trade.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount</span>
            <span className="font-medium">
              {formatCurrency(trade.amount, trade.currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status</span>
            <span className="text-green-600 font-medium">Completed</span>
          </div>
        </div>

        <div className="flex justify-center">
          <QRCode value={trade.reference} size={120} />
        </div>

        <Button
          onClick={onDownload}
          variant="outline"
          className="w-full"
        >
          Download Receipt
        </Button>
      </Card>
    </motion.div>
  );
}