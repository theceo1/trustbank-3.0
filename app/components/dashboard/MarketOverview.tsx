"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import PriceChart from "@/app/components/dashboard/PriceChart";
import { cn } from "@/lib/utils";

interface MarketData {
  timestamp: number;
  price: number;
}

const mockData: MarketData[] = [
  { timestamp: 1700000000000, price: 25000000 },
  { timestamp: 1700001000000, price: 25100000 },
  { timestamp: 1700002000000, price: 25200000 },
  { timestamp: 1700003000000, price: 25150000 },
  { timestamp: 1700004000000, price: 25300000 },
  { timestamp: 1700005000000, price: 25400000 },
  { timestamp: 1700006000000, price: 25450000 },
  { timestamp: 1700007000000, price: 25500000 },
  { timestamp: 1700008000000, price: 25550000 },
  { timestamp: 1700009000000, price: 25600000 },
];

interface MarketOverviewProps {
  className?: string;
}

export function MarketOverview({ className }: MarketOverviewProps) {
  const currentPrice = mockData[mockData.length - 1].price;
  const previousPrice = mockData[0].price;
  const priceChange = currentPrice - previousPrice;
  const percentageChange = (priceChange / previousPrice) * 100;
  const isPositive = priceChange >= 0;

  const formatPrice = (price: number) => formatCurrency(price, 'ngn');

  return (
    <Card className={cn(className, "")}>
      <CardHeader>
        <CardTitle>Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Price</p>
            <h2 className="text-3xl font-bold">{formatPrice(currentPrice)}</h2>
            <p className={cn(
              "text-sm",
              isPositive ? "text-green-500" : "text-red-500"
            )}>
              {isPositive ? "+" : ""}{percentageChange.toFixed(2)}%
            </p>
          </div>
          <div className="h-[200px]">
            <PriceChart data={mockData} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 