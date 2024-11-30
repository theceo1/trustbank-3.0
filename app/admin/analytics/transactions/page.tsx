"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "../components/DateRangePicker";
import { Download } from "lucide-react";
import { TransactionAnalytics } from '../components';
import { TimeframeType, useAnalyticsData } from '../hooks/useAnalyticsData';
import { DateRange } from 'react-day-picker';
import { DashboardSkeleton } from "../../components/DashboardSkeleton";

export default function TransactionAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });
  const [timeframe, setTimeframe] = useState<TimeframeType>('daily');
  
  const { data, isLoading } = useAnalyticsData({
    dateRange,
    timeframe
  });

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transaction Analytics</h1>
        <div className="flex items-center gap-4">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <Select value={timeframe} onValueChange={(value: TimeframeType) => setTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <TransactionAnalytics
        data={data.transactionMetrics}
        timeframe={timeframe}
      />
    </div>
  );
}