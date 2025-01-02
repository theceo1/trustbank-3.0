"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUpDown } from "lucide-react";

interface VerificationStatus {
  tier1_verified: boolean;
  tier2_verified: boolean;
  tier3_verified: boolean;
}

interface UsageData {
  used: number;
  limit: number;
}

interface TransactionLimitsProps {
  verificationStatus?: VerificationStatus;
  dailyUsage?: UsageData;
  monthlyUsage?: UsageData;
}

interface LimitData {
  type: string;
  current: number;
  limit: number;
  period: string;
}

const MOCK_LIMITS: LimitData[] = [
  {
    type: "Withdrawal",
    current: 750000,
    limit: 1000000,
    period: "Daily"
  },
  {
    type: "Deposit",
    current: 2500000,
    limit: 5000000,
    period: "Daily"
  },
  {
    type: "Trading",
    current: 4500000,
    limit: 10000000,
    period: "Daily"
  }
];

export function TransactionLimits({ verificationStatus, dailyUsage, monthlyUsage }: TransactionLimitsProps) {
  const limits = dailyUsage && monthlyUsage ? [
    {
      type: "Daily",
      current: dailyUsage.used,
      limit: dailyUsage.limit,
      period: "24h"
    },
    {
      type: "Monthly",
      current: monthlyUsage.used,
      limit: monthlyUsage.limit,
      period: "30d"
    }
  ] : MOCK_LIMITS;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const calculatePercentage = (current: number, limit: number) => {
    return Math.min(Math.round((current / limit) * 100), 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ArrowUpDown className="h-4 w-4" />
          <span>Transaction Limits</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {limits.map((item) => {
            const percentage = calculatePercentage(item.current, item.limit);
            return (
              <div key={item.type} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div>
                    <span className="font-medium">{item.type}</span>
                    <span className="text-muted-foreground"> ({item.period})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{formatCurrency(item.current)}</span>
                    <span className="text-muted-foreground"> / {formatCurrency(item.limit)}</span>
                  </div>
                </div>
                <div className="relative">
                  <Progress
                    value={percentage}
                    className={`h-2 ${getProgressColor(percentage)}`}
                  />
                  {percentage >= 90 && (
                    <p className="text-xs text-red-500 mt-1">
                      Approaching limit
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 