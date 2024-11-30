import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KYC_TIERS } from "@/app/lib/constants/kyc-tiers";
import { CheckCircle, XCircle } from "lucide-react";

interface TierInfoProps {
  currentTier: string;
  userVerifications: string[];
}

export function TierInfoCard({ currentTier, userVerifications }: TierInfoProps) {
  const tiers = [
    {
      name: "Tier 1",
      requirements: ["BVN Verification"],
      limits: KYC_TIERS.tier1,
      requiredDocs: ["bvn"]
    },
    {
      name: "Tier 2",
      requirements: ["NIN Verification"],
      limits: KYC_TIERS.tier2,
      requiredDocs: ["nin"]
    },
    {
      name: "Tier 3",
      requirements: ["International Passport or Driver's License"],
      limits: KYC_TIERS.tier3,
      requiredDocs: ["international_passport", "drivers_license"]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {tiers.map((tier) => (
        <Card key={tier.name} className={currentTier === tier.name.toLowerCase().replace(" ", "") ? "border-green-500" : ""}>
          <CardHeader>
            <CardTitle className="flex justify-between">
              {tier.name}
              {userVerifications.some(v => tier.requiredDocs.includes(v)) ? 
                <CheckCircle className="text-green-500" /> : 
                <XCircle className="text-gray-300" />
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-semibold">Requirements:</p>
              <ul className="list-disc list-inside text-sm">
                {tier.requirements.map((req) => (
                  <li key={req}>{req}</li>
                ))}
              </ul>
              <div className="mt-4">
                <p className="font-semibold">Limits:</p>
                <ul className="text-sm space-y-1">
                  <li>Daily: ₦{tier.limits.dailyLimit.toLocaleString()}</li>
                  <li>Monthly: ₦{tier.limits.monthlyLimit.toLocaleString()}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}