'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownUp, ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentTransactionsListProps {
  className?: string;
}

export function RecentTransactionsList({ className }: RecentTransactionsListProps) {
  const transactions = [
    {
      id: 1,
      type: "buy",
      currency: "BTC",
      amount: "0.0025",
      value: "₦500,000",
      status: "completed",
      date: "2023-11-15"
    },
    {
      id: 2,
      type: "sell",
      currency: "ETH",
      amount: "0.5",
      value: "₦750,000",
      status: "completed",
      date: "2023-11-14"
    },
    {
      id: 3,
      type: "buy",
      currency: "USDT",
      amount: "1000",
      value: "₦1,000,000",
      status: "completed",
      date: "2023-11-13"
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "buy":
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      case "sell":
        return <ArrowUp className="h-4 w-4 text-red-500" />;
      default:
        return <ArrowDownUp className="h-4 w-4" />;
    }
  };

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
                    {transaction.amount} {transaction.currency}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{transaction.value}</p>
                <p className="text-sm text-muted-foreground">{transaction.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 