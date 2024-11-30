"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { TradeStatus } from '@/app/types/trade';

interface TradeStatusMonitorProps {
  tradeId: string;
  initialStatus: TradeStatus;
  onStatusChange: (status: TradeStatus) => void;
}

const STATUS_STEPS = {
  [TradeStatus.PENDING]: 25,
  [TradeStatus.PROCESSING]: 75,
  [TradeStatus.COMPLETED]: 100,
  [TradeStatus.FAILED]: 100
};

const STATUS_CONFIG = {
  [TradeStatus.PENDING]: {
    icon: Clock,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    message: "Awaiting confirmation..."
  },
  [TradeStatus.PROCESSING]: {
    icon: Loader2,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    message: "Processing your trade..."
  },
  [TradeStatus.COMPLETED]: {
    icon: CheckCircle2,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    message: "Trade completed successfully!"
  },
  [TradeStatus.FAILED]: {
    icon: AlertCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    message: "Trade failed. Please try again."
  }
};

export function TradeStatusMonitor({ tradeId, initialStatus, onStatusChange }: TradeStatusMonitorProps) {
  const [status, setStatus] = useState<TradeStatus>(initialStatus);
  const [progress, setProgress] = useState(STATUS_STEPS[initialStatus]);
  const statusConfig = STATUS_CONFIG[status];

  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/trades/${tradeId}/status`);
        const data = await response.json();
        
        if (mounted && data.status !== status) {
          setStatus(data.status);
          setProgress(STATUS_STEPS[data.status as keyof typeof STATUS_STEPS]);
          onStatusChange(data.status);
        }
      } catch (error) {
        console.error('Failed to fetch trade status:', error);
      }
    };

    const interval = setInterval(checkStatus, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [tradeId, status, onStatusChange]);

  return (
    <Card className="overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 space-y-6"
      >
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={progress} 
            className="h-2 transition-all duration-500"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Initiated</span>
            <span>Processing</span>
            <span>Completed</span>
          </div>
        </div>

        {/* Status Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-4 p-4 rounded-xl ${statusConfig.bgColor}`}
          >
            <div className={`${statusConfig.color}`}>
              {status === TradeStatus.PROCESSING ? (
                <statusConfig.icon className="h-6 w-6 animate-spin" />
              ) : (
                <statusConfig.icon className="h-6 w-6" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={statusConfig.color}>
                  {status.toUpperCase()}
                </Badge>
                <span className="text-sm font-medium">
                  {statusConfig.message}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Estimated Time */}
        <div className="text-center text-sm text-muted-foreground">
          {status === TradeStatus.PENDING && "Estimated completion time: 5-15 minutes"}
          {status === TradeStatus.PROCESSING && "Processing... Please wait"}
          {status === TradeStatus.COMPLETED && "Trade completed successfully"}
          {status === TradeStatus.FAILED && "Please contact support if you need assistance"}
        </div>
      </motion.div>
    </Card>
  );
}