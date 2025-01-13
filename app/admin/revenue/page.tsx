"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, Wallet } from "lucide-react";

interface RevenueData {
  id: string;
  trade_id: string;
  amount: number;
  currency: string;
  fee_type: 'platform' | 'processing';
  created_at: string;
}

interface DailyRevenue {
  date: string;
  platform: number;
  processing: number;
  total: number;
}

export default function RevenuePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [chartData, setChartData] = useState<DailyRevenue[]>([]);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/revenue');
        if (!response.ok) {
          throw new Error('Failed to fetch revenue data');
        }
        const data = await response.json();
        setRevenueData(data);
        processChartData(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch revenue data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [toast]);

  const processChartData = (data: RevenueData[]) => {
    const dailyData = data.reduce((acc: { [key: string]: DailyRevenue }, item) => {
      const date = format(new Date(item.created_at), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = {
          date,
          platform: 0,
          processing: 0,
          total: 0
        };
      }
      
      if (item.fee_type === 'platform') {
        acc[date].platform += item.amount;
      } else {
        acc[date].processing += item.amount;
      }
      acc[date].total = acc[date].platform + acc[date].processing;
      
      return acc;
    }, {});

    const sortedData = Object.values(dailyData).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    setChartData(sortedData);
  };

  const calculateTotalRevenue = () => {
    return revenueData.reduce((total, item) => total + item.amount, 0);
  };

  const calculatePlatformRevenue = () => {
    return revenueData
      .filter(item => item.fee_type === 'platform')
      .reduce((total, item) => total + item.amount, 0);
  };

  const calculateProcessingRevenue = () => {
    return revenueData
      .filter(item => item.fee_type === 'processing')
      .reduce((total, item) => total + item.amount, 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Revenue Analytics</h1>
          <Select value={period} onValueChange={(value: 'day' | 'week' | 'month') => setPeriod(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{calculateTotalRevenue().toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Combined platform and processing fees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Platform Revenue
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{calculatePlatformRevenue().toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                1.6% platform fee earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Processing Revenue
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{calculateProcessingRevenue().toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                1.4% processing fee earnings
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>
              View revenue trends over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Amount']}
                    labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="platform" 
                    stroke="#10B981" 
                    name="Platform Fee"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="processing" 
                    stroke="#6366F1" 
                    name="Processing Fee"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#000000" 
                    name="Total"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 