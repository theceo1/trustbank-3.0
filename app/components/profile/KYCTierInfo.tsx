// app/components/profile/KYCTierInfo.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KYC_LIMITS, KYCTier } from "@/app/types/kyc";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface KYCTierInfoProps {
  currentTier: string;
  verificationStatus: string;
  completedRequirements?: string[];
}

const TIER_INFO = {
  unverified: {
    key: 'unverified',
    name: 'Unverified',
    requirements: [],
    limits: KYC_LIMITS[KYCTier.NONE]
  },
  basic: {
    key: 'basic',
    name: 'Basic',
    requirements: ['BVN Verification'],
    limits: KYC_LIMITS[KYCTier.BASIC]
  },
  intermediate: {
    key: 'intermediate',
    name: 'Intermediate',
    requirements: ['NIN Verification'],
    limits: KYC_LIMITS[KYCTier.INTERMEDIATE]
  },
  advanced: {
    key: 'advanced',
    name: 'Advanced',
    requirements: ['International Passport or Driver\'s License'],
    limits: KYC_LIMITS[KYCTier.ADVANCED]
  }
};

export function KYCTierInfo({ currentTier, verificationStatus, completedRequirements = [] }: KYCTierInfoProps) {
  const tier = TIER_INFO[currentTier as keyof typeof TIER_INFO];
  const nextTier = getNextTier(currentTier);
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Verification Status: {verificationStatus}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Current Tier: {currentTier.toUpperCase()}</h3>
              <p className="text-sm text-muted-foreground">
                Daily Limit: ₦{tier.limits.dailyLimit.toLocaleString()}<br />
                Monthly Limit: ₦{tier.limits.monthlyLimit.toLocaleString()}
              </p>
            </div>
            
            {nextTier && (
              <div>
                <h4 className="text-sm font-medium">Requirements for {nextTier.name}</h4>
                <ul className="mt-2 space-y-2">
                  {nextTier.requirements.map((req) => (
                    <li key={req} className="flex items-center text-sm">
                      {completedRequirements.includes(req) ? "✓" : "○"} {req}
                    </li>
                  ))}
                </ul>
                {nextTier.key !== "unverified" && (
                  <Link href={`/profile/verification/${nextTier.key.toLowerCase()}`}>
                    <Button 
                      className="w-full"
                      disabled={
                        currentTier === nextTier.key ||
                        (nextTier.key === "intermediate" && currentTier === "unverified") ||
                        (nextTier.key === "advanced" && currentTier !== "intermediate")
                      }
                    >
                      {currentTier === nextTier.key ? "Already Verified" : "Upgrade to " + nextTier.name}
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getNextTier(currentTier: string) {
  const tiers = Object.entries(TIER_INFO);
  const currentIndex = tiers.findIndex(([key]) => key === currentTier);
  if (currentIndex < tiers.length - 1) {
    const [nextTierKey, nextTierInfo] = tiers[currentIndex + 1];
    return nextTierInfo;
  }
  return null;
}