"use client";

import { Line, Area, ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface TrendChartProps {
  data: Array<{
    date: string;
    value: number;
  }>;
  valueKey?: string;
  color?: string;
}

export function TrendChart({ data, valueKey = 'value', color = '#8884d8' }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey={valueKey} 
          stroke={color} 
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}