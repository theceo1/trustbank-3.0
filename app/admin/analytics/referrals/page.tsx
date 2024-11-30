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
import { DateRangePicker } from "../components/DateRangePicker";
import { Download, Calendar } from "lucide-react";
import { ReferralAnalytics } from '../components';
import { processReferralData } from '../utils/dataProcessing';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { DateRange } from 'react-day-picker';
import { DashboardSkeleton } from '../../components/DashboardSkeleton';

export default function ReferralAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });

  const { data, isLoading } = useAnalyticsData({
    dateRange,
    timeframe: 'daily'
  });

  if (isLoading || !data) {
    return <DashboardSkeleton />;
  }

  return (
    <div>
      <DateRangePicker
        value={dateRange}
        onChange={setDateRange}
      />
      <ReferralAnalytics
        data={data.referralMetrics}
        timeframe="daily"
      />
    </div>
  );
}