// app/components/profile/TierComparison.tsx
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KYC_LIMITS, KYCTier } from "@/app/types/kyc";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TierComparisonProps {
  currentTier: string;
  completedRequirements: string[];
}

const TIER_INFO = {
  unverified: {
    key: 'unverified',
    name: 'Unverified',
    description: 'Basic account with limited features',
    requirements: [],
    benefits: ['Basic account access', 'View market rates'],
    limits: KYC_LIMITS[KYCTier.NONE],
    color: 'text-gray-500'
  },
  basic: {
    key: 'basic',
    name: 'Basic',
    description: 'Start trading with basic verification',
    requirements: ['BVN Verification'],
    benefits: ['Small transactions', 'Basic trading features'],
    limits: KYC_LIMITS[KYCTier.BASIC],
    color: 'text-blue-500'
  },
  intermediate: {
    key: 'intermediate',
    name: 'Intermediate',
    description: 'Enhanced trading limits with additional verification',
    requirements: ['NIN Verification'],
    benefits: ['Higher transaction limits', 'Advanced trading features'],
    limits: KYC_LIMITS[KYCTier.INTERMEDIATE],
    color: 'text-green-500'
  },
  advanced: {
    key: 'advanced',
    name: 'Advanced',
    description: 'Maximum trading capabilities',
    requirements: ['International Passport or Driver\'s License'],
    benefits: ['Highest transaction limits', 'All platform features', 'Priority support'],
    limits: KYC_LIMITS[KYCTier.ADVANCED],
    color: 'text-purple-500'
  }
};

export function TierComparison({ currentTier, completedRequirements }: TierComparisonProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px] grid grid-cols-4 gap-4 p-4">
        {Object.entries(TIER_INFO).map(([tierKey, tier], index) => (
          <motion.div
            key={tierKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn(
              "h-full",
              currentTier === tierKey && "border-2 border-primary"
            )}>
              <CardHeader>
                <CardTitle className={cn("text-lg font-bold", tier.color)}>
                  {tier.name}
                  {currentTier === tierKey && (
                    <span className="ml-2 text-sm text-primary">(Current)</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                  <div className="mt-4">
                    <p className="font-medium">Limits:</p>
                    <ul className="text-sm space-y-1">
                      <li>Daily: ₦{tier.limits.dailyLimit.toLocaleString()}</li>
                      <li>Monthly: ₦{tier.limits.monthlyLimit.toLocaleString()}</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Requirements:</p>
                  <ul className="mt-2 space-y-2">
                    {tier.requirements.map((req) => (
                      <li key={req} className="flex items-center text-sm">
                        {completedRequirements.includes(req) ? (
                          <Check className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <X className="w-4 h-4 text-red-500 mr-2" />
                        )}
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Benefits:</p>
                  <ul className="mt-2 space-y-1">
                    {tier.benefits.map((benefit) => (
                      <li key={benefit} className="text-sm flex items-center">
                        <Check className="w-3 h-3 text-green-500 mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}