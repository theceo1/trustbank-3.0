import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KYC_TIERS } from "@/app/lib/constants/kyc-tiers";
import { Badge } from "@/components/ui/badge";
import { Shield, ChevronRight } from "lucide-react";
import Link from "next/link";

export function KYCStatus({ currentTier }: { currentTier: string }) {
  const tier = KYC_TIERS[currentTier as keyof typeof KYC_TIERS];
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">KYC Status</CardTitle>
        <Shield className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Current Tier</p>
            <Badge variant={currentTier === 'unverified' ? 'destructive' : 'default'}>
              {currentTier.toUpperCase()}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Daily Limit: ₦{tier.dailyLimit.toLocaleString()}
          </div>
          <Link 
            href="/profile/verification" 
            className="flex items-center text-sm text-primary hover:underline"
          >
            Upgrade Limits
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}