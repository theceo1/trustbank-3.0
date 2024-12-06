import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WalletCardProps {
  currency: string;
  balance: number;
  onTrade?: () => void;
  onDeposit?: () => void;
}

export function WalletCard({ currency, balance, onTrade, onDeposit }: WalletCardProps) {
  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <Wallet className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-lg">{currency}</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Available Balance</p>
            <p className="text-2xl font-bold">{formatCurrency(balance, currency)}</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={onTrade}
              className="flex-1 bg-green-600 hover:bg-green-300 text-white dark:hover:test"
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Trade
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 