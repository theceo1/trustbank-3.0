"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface PriceChartProps {
  data: Array<{
    timestamp: number;
    price: number;
  }>;
}

export default function PriceChart({ data }: PriceChartProps) {
  const isPositive = data[data.length - 1].price >= data[0].price;
  const formatPrice = (price: number) => formatCurrency(price, 'ngn');

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis
          dataKey="timestamp"
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
          hide
        />
        <YAxis
          dataKey="price"
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={formatPrice}
          hide
        />
        <Tooltip
          formatter={(value: number) => [formatPrice(value), 'Price']}
          labelFormatter={(timestamp: number) => new Date(timestamp).toLocaleString()}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke={isPositive ? '#22c55e' : '#ef4444'}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
} 