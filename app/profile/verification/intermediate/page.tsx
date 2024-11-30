"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/ui/back-button";
import { KYCIntermediateForm } from "@/app/components/verification/KYCIntermediateForm";

export default function IntermediateVerificationPage() {
  const { user, kycInfo, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && kycInfo) {
      // Check if user has completed basic tier
      if (kycInfo.currentTier === "unverified") {
        toast({
          id: "tier1-required",
          title: "Complete Basic First",
          description: "Please complete basic verification before proceeding",
          variant: "destructive",
        });
        router.push("/profile/verification/basic");
        return;
      }
      
      // Prevent re-verification if already completed this tier or higher
      if (["intermediate", "advanced"].includes(kycInfo.currentTier)) {
        toast({
          id: "tier-already-verified",
          title: "Already Verified",
          description: "You have already completed intermediate verification",
          variant: "default",
        });
        router.push("/profile/verification");
      }
    }
  }, [kycInfo, loading, router, toast]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-20">
      <BackButton />
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Intermediate Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <KYCIntermediateForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}