"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/ui/back-button";
import { KYCBasicForm } from "@/app/components/verification/KYCBasicForm";

export default function BasicVerificationPage() {
  const { user, kycInfo, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && kycInfo) {
      // Redirect if user has already completed this tier or higher
      if (["basic", "intermediate", "advanced"].includes(kycInfo.currentTier)) {
        toast({
          id: "tier-already-verified",
          title: "Already Verified",
          description: "You have already completed basic verification",
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
            <CardTitle>Basic Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <KYCBasicForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}