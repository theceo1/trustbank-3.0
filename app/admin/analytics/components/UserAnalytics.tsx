"use client";

import { useState, useEffect, FC, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import supabase from "@/lib/supabase/client";
import { COLORS, processUserData } from "../utils/dataProcessing";
import { TimeframeType } from '../hooks/useAnalyticsData';
import { TimeSeriesData } from '../types';

interface UserAnalyticsProps {
  data: {
    totalUsers: number;
    activeUsers: number;
    growth: number;
    retention: number;
    usersByTime: TimeSeriesData[];
  };
  timeframe: TimeframeType;
}

const UserAnalytics: FC<UserAnalyticsProps> = ({ data, timeframe }) => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserAnalytics = useCallback(async () => {
    try {
      const { data: users } = await supabase
        .from('profiles')
        .select('*');

      const processedData = processUserData(users || [], timeframe);
      setUserData(processedData);
    } catch (error) {
      console.error('Error fetching user analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchUserAnalytics();
  }, [fetchUserAnalytics]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userData?.demographics}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {userData?.demographics.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Add more user analytics cards */}
      </div>
    </div>
  );
};

export default UserAnalytics;