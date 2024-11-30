import { CryptoData } from "@/app/types/market";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface CryptoListProps {
  data: CryptoData[];
  isLoading: boolean;
  limit?: number;
}

export function CryptoList({ data, isLoading, limit = 5 }: CryptoListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Take only the first 'limit' items
  const limitedData = data.slice(0, limit);

  return (
    <div className="space-y-4">
      {limitedData.map((crypto) => (
        <div key={crypto.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
          <div className="flex items-center space-x-3">
            <Image
              src={crypto.image}
              alt={crypto.name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <p className="font-medium">{crypto.name}</p>
              <p className="text-sm text-muted-foreground">{crypto.symbol.toUpperCase()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">${crypto.current_price.toLocaleString()}</p>
            <p className={`text-sm ${crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
              {crypto.price_change_percentage_24h.toFixed(2)}%
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}