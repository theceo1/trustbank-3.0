"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/app/lib/utils';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  created_at: string;
}

interface TransactionHistoryProps {
  limit?: number;
  type?: 'deposit' | 'withdrawal' | 'transfer';
}

export default function TransactionHistory({ limit = 10, type }: TransactionHistoryProps) {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        if (!session?.user?.id) return;

        setLoading(true);
        const queryParams = new URLSearchParams({
          limit: limit.toString(),
          ...(type && { type })
        });

        const response = await fetch(`/api/transactions?${queryParams}`);
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
  }, [session?.user?.id, limit, type]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-3 w-[60px]" />
            </div>
            <Skeleton className="h-4 w-[80px]" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-4">
        No transactions found
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </span>
                <Badge variant={
                  transaction.status === 'completed' ? 'default' :
                  transaction.status === 'pending' ? 'secondary' : 'destructive'
                }>
                  {transaction.status}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(transaction.created_at), 'MMM d, yyyy HH:mm')}
              </div>
            </div>
            <div className="text-sm font-medium capitalize">
              {transaction.type}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
} 