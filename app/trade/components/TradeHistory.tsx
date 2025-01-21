// app/trade/components/TradeHistory.tsx
"use client";

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from '@/app/lib/utils';
import { TradeDetails } from '@/app/types/trade';

interface TradeHistoryProps {
  trades: TradeDetails[];
  onTradeSelect?: (trade: TradeDetails) => void;
}

export function TradeHistory({ trades, onTradeSelect }: TradeHistoryProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TradeDetails;
    direction: 'asc' | 'desc';
  }>({ key: 'timestamp', direction: 'desc' });

  const handleSort = (key: keyof TradeDetails) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedTrades = [...trades].sort((a, b) => {
    if (sortConfig.key === 'timestamp') {
      return sortConfig.direction === 'asc'
        ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return sortConfig.direction === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('timestamp')}
            >
              Time
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('pair')}
            >
              Pair
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('type')}
            >
              Type
            </TableHead>
            <TableHead 
              className="cursor-pointer text-right"
              onClick={() => handleSort('price')}
            >
              Price
            </TableHead>
            <TableHead 
              className="cursor-pointer text-right"
              onClick={() => handleSort('amount')}
            >
              Amount
            </TableHead>
            <TableHead 
              className="cursor-pointer text-right"
              onClick={() => handleSort('total')}
            >
              Total
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort('status')}
            >
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTrades.map((trade) => (
            <TableRow
                    key={trade.id}
              className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 ${
                onTradeSelect ? 'cursor-pointer' : ''
              }`}
              onClick={() => onTradeSelect?.(trade)}
            >
              <TableCell>{formatDate(trade.timestamp)}</TableCell>
              <TableCell>{trade.pair}</TableCell>
              <TableCell>
                <span className={trade.type === 'buy' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {trade.type.toUpperCase()}
                </span>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(trade.price, 'ngn')}</TableCell>
              <TableCell className="text-right">{trade.amount}</TableCell>
              <TableCell className="text-right">{formatCurrency(trade.total, 'ngn')}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  trade.status === 'completed'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : trade.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {trade.status.toUpperCase()}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}