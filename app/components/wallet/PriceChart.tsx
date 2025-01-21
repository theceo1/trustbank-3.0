"use client";

import { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

interface PriceChartProps {
  data: {
    time: string;
    value: number;
  }[];
  containerClassName?: string;
}

export default function PriceChart({ data, containerClassName = "" }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#999',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      width: chartContainerRef.current.clientWidth,
      height: 100,
      rightPriceScale: {
        visible: false,
      },
      timeScale: {
        visible: false,
      },
    });

    const areaSeries = chart.addAreaSeries({
      lineColor: '#00A651',
      topColor: '#00A651',
      bottomColor: 'rgba(0, 166, 81, 0.04)',
    });

    areaSeries.setData(data);

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div ref={chartContainerRef} className={containerClassName} />
  );
} 