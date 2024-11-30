"use client";

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Card } from "@/components/ui/card";
import { TradeDetails } from '@/app/types/trade';
import { TradeChartProps, TradeChartData, TradeChartOptions } from '@/app/types/chart';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function TradeChart({ trades, period = 'week', height = 400 }: TradeChartProps) {
  const chartData: TradeChartData = useMemo(() => ({
    labels: trades.map(trade => new Date(trade.created_at).toLocaleDateString()),
    datasets: [{
      label: 'Trade Volume',
      data: trades.map(trade => trade.amount),
      fill: true,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.4
    }]
  }), [trades]);

  const options: TradeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  return (
    <div style={{ height: `${height}px` }} className="p-4">
      <Line data={chartData} options={options} />
    </div>
  );
}