"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TradeMetrics } from './TradeMetrics';
import { TradeChart } from './TradeChart';
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, ChevronRight } from "lucide-react";
import { TradeDetails } from '@/app/types/trade';

interface TradeHistoryProps {
  trades: TradeDetails[];
}

export function TradeHistory({ trades }: TradeHistoryProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);

  const periods = [
    { value: 'all', label: 'All Time' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <TradeMetrics trades={trades} />

      {/* Trade History & Analytics */}
      <Card className="overflow-hidden">
        <Tabs defaultValue="list" className="w-full">
          <div className="px-4 pt-4 flex justify-between items-center">
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="list">History</TabsTrigger>
              <TabsTrigger value="chart">Analytics</TabsTrigger>
            </TabsList>
            
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'day' | 'week' | 'month')}
              className="text-sm bg-transparent border rounded-md px-2 py-1"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          <TabsContent value="list" className="mt-4">
            <div className="space-y-2">
              <AnimatePresence>
                {trades.map((trade) => (
                  <motion.div
                    key={trade.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setExpandedTradeId(
                      expandedTradeId === trade.id ? null : trade.id
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {trade.type === 'buy' ? (
                          <ArrowDownRight className="h-5 w-5 text-green-500" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">
                            {trade.type === 'buy' ? 'Bought' : 'Sold'} {trade.currency.toUpperCase()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(trade.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(trade.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Rate: {formatCurrency(trade.rate)}
                        </p>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedTradeId === trade.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 pt-4 border-t"
                        >
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Status</p>
                              <p className="font-medium capitalize">{trade.status}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Payment Method</p>
                              <p className="font-medium capitalize">{trade.payment_method}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Service Fee</p>
                              <p className="font-medium">{formatCurrency(trade.fees.quidax)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Network Fee</p>
                              <p className="font-medium">{formatCurrency(trade.fees.platform)}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="chart" className="mt-4">
            <TradeChart trades={trades} period={selectedPeriod} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}