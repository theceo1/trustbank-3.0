import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface PriceChartProps {
  data: Array<{
    timestamp: number;
    price: number;
  }>;
  height?: number;
  timeFrame: string;
  isLoading?: boolean;
}

export function PriceChart({ data, height = 400, timeFrame, isLoading = false }: PriceChartProps) {
  console.log('PriceChart props:', { dataLength: data.length, timeFrame, isLoading });

  if (isLoading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-muted/10 rounded-lg">
        <p>Loading chart data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-muted/10 rounded-lg">
        <p>No data available</p>
        <pre className="text-xs mt-2">Debug: {JSON.stringify({ data, timeFrame }, null, 2)}</pre>
      </div>
    );
  }

  // Calculate min and max for better chart scaling
  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices) * 0.9995;
  const maxPrice = Math.max(...prices) * 1.0005;

  const formatXAxis = (timestamp: number) => {
    switch (timeFrame) {
      case '1H':
        return format(new Date(timestamp), 'HH:mm');
      case '24H':
        return format(new Date(timestamp), 'HH:mm');
      case '7D':
        return format(new Date(timestamp), 'MMM dd');
      case '30D':
        return format(new Date(timestamp), 'MMM dd');
      default:
        return format(new Date(timestamp), 'MMM dd');
    }
  };

  return (
    <div className="w-full h-[400px] mt-4">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            opacity={0.1} 
            vertical={false}
          />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            tick={{ fontSize: 12 }}
            minTickGap={30}
            dy={10}
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            tick={{ fontSize: 12 }}
            width={80}
            dx={-10}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload?.[0]) {
                return (
                  <div className="bg-background border rounded-lg p-2 shadow-lg">
                    <p className="text-sm font-medium">
                      {format(new Date(payload[0].payload.timestamp), 'PPp')}
                    </p>
                    <p className="text-sm text-green-500">
                      ${Number(payload[0].value).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#colorPrice)"
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}