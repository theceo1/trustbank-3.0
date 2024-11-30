"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import supabase from "@/lib/supabase/client";
import { processReferralData } from "../utils/dataProcessing";
import { TimeframeType } from '../hooks/useAnalyticsData';

interface ReferralAnalyticsProps {
  data: {
    referralsByTime: Array<{ date: string; count: number }>;
    referralsByTier: Record<string, number>;
    totalReferrals: number;
    activeReferrers: number;
    conversionRate: number;
    averageCommission: number;
    topReferrers: Array<{
      id: string;
      name: string;
      email: string;
      count: number;
      tier: string;
    }>;
  };
  timeframe: TimeframeType;
}

export default function ReferralAnalytics({ data, timeframe }: ReferralAnalyticsProps) {
  const [referralData, setReferralData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReferralAnalytics = useCallback(async () => {
    try {
      // Fetch referral performance data
      const { data: referrals } = await supabase
        .from('profiles')
        .select(`
          referral_code,
          referral_count,
          referral_earnings,
          referral_tier,
          referred_users:profiles!referred_by(count)
        `)
        .not('referral_count', 'eq', 0);

      const processedData = processReferralData(referrals || [], timeframe);
      setReferralData(processedData);
    } catch (error) {
      console.error('Error fetching referral analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchReferralAnalytics();
  }, [fetchReferralAnalytics]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Referral Performance by Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={referralData?.tierPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tier" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Number of Referrers" />
                <Bar yAxisId="right" dataKey="earnings" fill="#82ca9d" name="Total Earnings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={referralData?.conversionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rate" stroke="#8884d8" name="Conversion Rate" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {referralData?.topReferrers.map((referrer: any) => (
                <div key={referrer.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{referrer.name}</p>
                    <p className="text-sm text-gray-500">{referrer.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{referrer.count} referrals</p>
                    <Badge>{referrer.tier}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}