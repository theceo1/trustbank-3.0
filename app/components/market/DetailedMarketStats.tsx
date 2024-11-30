import { DetailedCryptoPrice } from '@/app/types/market';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber, formatPercentage } from '@/app/lib/utils/format';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

interface DetailedMarketStatsProps {
  cryptoData: DetailedCryptoPrice[];
}

export function DetailedMarketStats({ cryptoData }: DetailedMarketStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cryptoData.map((crypto) => (
        <Card key={crypto.symbol} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              {crypto.name} ({crypto.symbol})
            </CardTitle>
            <span 
              className={`flex items-center ${
                crypto.change24h >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {crypto.change24h >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {formatPercentage(crypto.change24h)}
            </span>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-2xl font-bold">{formatCurrency(crypto.price)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-lg">{formatCurrency(crypto.volume24h, undefined, true)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">24h High</p>
                <p className="text-green-500">{formatCurrency(crypto.high24h)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">24h Low</p>
                <p className="text-red-500">{formatCurrency(crypto.low24h)}</p>
              </div>
              <div className="col-span-2 space-y-2">
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p>{formatCurrency(crypto.marketCap, undefined, true)}</p>
              </div>
              <div className="col-span-2 space-y-2">
                <p className="text-sm text-muted-foreground">Circulating Supply</p>
                <p>{formatNumber(crypto.supply.circulating)} {crypto.symbol}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}