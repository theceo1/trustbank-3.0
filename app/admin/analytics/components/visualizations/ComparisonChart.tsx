"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ComparisonChartProps {
  title: string;
  data: any[];
  metrics: {
    key: string;
    name: string;
    color: string;
  }[];
  xAxisKey: string;
}

export function ComparisonChart({
  title,
  data,
  metrics,
  xAxisKey
}: ComparisonChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {metrics.map((metric) => (
              <Bar
                key={metric.key}
                dataKey={metric.key}
                name={metric.name}
                fill={metric.color}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}