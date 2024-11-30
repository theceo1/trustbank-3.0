"use client";

import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase/client";

export const dynamic = 'force-dynamic';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // Auto verify in development
  const handleVerification = async () => {
    if (process.env.NODE_ENV === 'development') {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: { 
            email_verified: true,
            kyc_level: 0
          }
        });
        
        toast({
          id: "verify-success",
          title: "Verified",
          description: "Your account has been verified",
        });
        
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleVerification} 
            className="w-full"
          >
            Verify Email
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="container flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            Please wait while we verify your email...
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}