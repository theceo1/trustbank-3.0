import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, Wallet, ArrowUpRight, Clock } from "lucide-react";
import { KYC_TIERS } from "@/app/lib/constants/kyc-tiers";
import Link from "next/link";

interface ProfileDashboardProps {
  user: any;
  kycInfo: any;
  recentTransactions?: any[];
}

export function ProfileDashboard({ user, kycInfo, recentTransactions = [] }: ProfileDashboardProps) {
  const currentTier = KYC_TIERS[kycInfo?.currentTier as keyof typeof KYC_TIERS] || KYC_TIERS.unverified;
  
  const getVerificationProgress = () => {
    const totalRequirements = KYC_TIERS.tier3.requirements.length;
    const completed = kycInfo?.completedRequirements?.length || 0;
    return (completed / totalRequirements) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Verification Status</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-2xl font-bold">{currentTier.name}</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {Math.round(getVerificationProgress())}% Complete
                  </span>
                </div>
                <Progress value={getVerificationProgress()} className="h-2" />
                <Link 
                  href="/profile/verification"
                  className="text-sm text-primary hover:underline flex items-center"
                >
                  Complete Verification <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Add more dashboard cards here */}
      </div>
    </div>
  );
}