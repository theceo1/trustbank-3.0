import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrustBankLogo } from '@/app/components/brand/Logo';

export function PaymentLoadingState() {
  return (
    <Card className="w-full max-w-md mx-auto bg-white">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <TrustBankLogo className="h-8 w-auto" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <div className="flex justify-center">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-primary rounded-full" />
              <div className="h-2 w-2 bg-primary rounded-full" />
              <div className="h-2 w-2 bg-primary rounded-full" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}