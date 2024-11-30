"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Download, Calendar } from "lucide-react";
import supabase from "@/lib/supabase/client";
import { DateRangePicker } from "./components/DateRangePicker";
import { UserAnalytics, ReferralAnalytics, TransactionAnalytics } from './components';
import { processTimeSeriesData, processReferralData } from './utils/dataProcessing';
import { TimeframeType, useAnalyticsData } from './hooks/useAnalyticsData';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { DateRange } from 'react-day-picker';

interface AnalyticsData {
  userGrowth: any[];
  referralMetrics: any[];
  transactionData: any[];
  conversionRates: any[];
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });
  const [timeframe, setTimeframe] = useState<TimeframeType>('daily');

  const { data, isLoading } = useAnalyticsData({
    dateRange,
    timeframe
  });

  const handleTimeframeChange = (value: TimeframeType) => {
    setTimeframe(value);
  };

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Overview</h1>
        <div className="flex items-center gap-4">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <Select value={timeframe} onValueChange={handleTimeframeChange}>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UserAnalytics data={data.userMetrics} timeframe={timeframe} />
        <ReferralAnalytics data={data.referralMetrics} timeframe={timeframe} />
        <TransactionAnalytics data={data.transactionMetrics} timeframe={timeframe} />
      </div>
    </div>
  );
}