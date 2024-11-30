// app/types/chart.ts

export type TimeFrame = '1H' | '24H' | '7D' | '30D' | 'ALL';

export interface ChartConfig {
    timeFrame: TimeFrame;
    interval: string;
    limit: number;
    aggregation: number;
  }
  
  export interface ChartTheme {
    backgroundColor: string;
    lineColor: string;
    textColor: string;
    gridColor: string;
    areaTopColor: string;
    areaBottomColor: string;
  }
  
  export interface ChartDimensions {
    width?: number | string;
    height?: number | string;
    margin?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  }
  
  export interface TooltipData {
    active?: boolean;
    payload?: any[];
    label?: string;
  }
  
  // Default chart configurations
  export const DEFAULT_CHART_THEME: ChartTheme = {
    backgroundColor: 'transparent',
    lineColor: '#2563eb', // Blue
    textColor: '#64748b', // Slate
    gridColor: '#e2e8f0', // Slate
    areaTopColor: 'rgba(37, 99, 235, 0.2)', // Blue with opacity
    areaBottomColor: 'rgba(37, 99, 235, 0.0)' // Transparent
  };
  
  export const DEFAULT_CHART_DIMENSIONS: ChartDimensions = {
    height: 400,
    margin: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 40
    }
  };
  
  export const TIME_FRAME_CONFIG: Record<TimeFrame, { interval: string; limit: number }> = {
    '1H': { interval: '1m', limit: 60 },
    '24H': { interval: '15m', limit: 96 },
    '7D': { interval: '1h', limit: 168 },
    '30D': { interval: '4h', limit: 180 },
    'ALL': { interval: '1d', limit: 365 }
  };

import { ChartData, ChartOptions } from 'chart.js';
import { TradeDetails } from './trade';

export interface TradeChartProps {
  trades: TradeDetails[];
  period?: 'day' | 'week' | 'month';
  height?: number;
}

export type TradeChartData = ChartData<'line'>;
export type TradeChartOptions = ChartOptions<'line'>;