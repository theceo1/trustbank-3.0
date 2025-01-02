"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from "lucide-react";

interface VolumeData {
  date: string;
  volume: number;
}

const MOCK_DATA: Record<string, VolumeData[]> = {
  '7d': Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
    volume: Math.random() * 1000000 + 500000
  })),
  '30d': Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    volume: Math.random() * 1000000 + 500000
  })),
  '90d': Array.from({ length: 12 }, (_, i) => ({
    date: new Date(Date.now() - (11 - i) * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    volume: Math.random() * 1000000 + 500000
  }))
};

export function TradingVolume() {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d');
  const data = MOCK_DATA[timeframe];

  const formatVolume = (volume: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(volume);
  };

  const calculateTotalVolume = () => {
    return data.reduce((sum, item) => sum + item.volume, 0);
  };

  const calculateAverageVolume = () => {
    return calculateTotalVolume() / data.length;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-4 w-4" />
          <span>Trading Volume</span>
        </CardTitle>
        <Select value={timeframe} onValueChange={(value: '7d' | '30d' | '90d') => setTimeframe(value)}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
            <SelectItem value="90d">90 Days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Volume</p>
              <p className="text-2xl font-bold">{formatVolume(calculateTotalVolume())}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average Volume</p>
              <p className="text-2xl font-bold">{formatVolume(calculateAverageVolume())}</p>
            </div>
          </div>

          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <Bar
                  dataKey="volume"
                  fill="currentColor"
                  className="fill-primary"
                  radius={[4, 4, 0, 0]}
                />
                <XAxis
                  dataKey="date"
                  stroke="currentColor"
                  className="text-muted-foreground text-xs"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="currentColor"
                  className="text-muted-foreground text-xs"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatVolume}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value;
                      if (typeof value === 'number') {
                        return (
                          <div className="bg-background border rounded p-2">
                            <p className="text-sm font-medium">{formatVolume(value)}</p>
                          </div>
                        );
                      }
                    }
                    return null;
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 