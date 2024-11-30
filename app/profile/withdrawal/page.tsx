"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export default function WithdrawalPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [amount, setAmount] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (user?.user_metadata?.is_verified) {
        setIsVerified(true);
      } else {
        toast({
          id: "verification-required",
          title: "Verification Required",
          description: "You need to complete KYC verification to make withdrawals.",
          variant: "destructive",
        });
        router.push('/profile/verification');
      }
    };
    checkVerificationStatus();
  }, [user, router, toast]);

  const handleWithdrawal = async () => {
    // Implement withdrawal logic here
    toast({
      id: "withdrawal-success",
      title: "Withdrawal Successful",
      description: `You have withdrawn ${amount} successfully.`,
      variant: "default",
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Withdraw Funds</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="number"
            placeholder="Enter amount to withdraw"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleWithdrawal} className="w-full bg-green-600 hover:bg-green-700">
            Withdraw
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}