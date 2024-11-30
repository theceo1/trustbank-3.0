import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function KYCPromotionCard({ currentTier }: { currentTier: string }) {
  const router = useRouter();

  return (
    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
      <CardHeader>
        <CardTitle className="text-lg">Upgrade Your Account Limits</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">
          {currentTier === 'unverified' 
            ? "Verify your identity to start trading with higher limits!"
            : "Upgrade to the next tier for increased trading limits!"}
        </p>
        <Button 
          onClick={() => router.push('/profile/verification')}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <ArrowUpRight className="mr-2 h-4 w-4" />
          Upgrade Now
        </Button>
      </CardContent>
    </Card>
  );
}