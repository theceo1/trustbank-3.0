'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownUp, ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthContext";
import { TransactionsSkeleton } from "@/app/components/skeletons";
import { formatCurrency } from "@/app/lib/utils";

interface Transaction {
  id: string;
  type: string;
  currency: string;
  amount: number;
  status: string;
  created_at: string;
}

interface RecentTransactionsListProps {
  className?: string;
}

export function RecentTransactionsList({ className }: RecentTransactionsListProps) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        if (!user?.id) return;

        setLoading(true);
        const response = await fetch('/api/transactions?limit=5');
        const data = await response.json();

        if (response.ok && Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.id]);

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "buy":
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      case "sell":
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      default:
        return <ArrowDownUp className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <TransactionsSkeleton />;
  }

  if (transactions.length === 0) {
    return (
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-muted-foreground py-4">
            No transactions found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                {getTransactionIcon(transaction.type)}
                <div>
                  <p className="font-medium">
                    {transaction.type.toUpperCase()} {transaction.currency}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(transaction.amount, transaction.currency)}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 