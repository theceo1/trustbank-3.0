'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { KYCService } from '@/app/lib/services/kyc';
import { useAuth } from '@/context/AuthContext';

export default function BVNVerification() {
  const [bvn, setBvn] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleVerify = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      await KYCService.verifyBVN(user.id, bvn);
      toast({
        id: "bvn-verification-success",
        title: "Verification Successful",
        description: "Your BVN has been verified successfully",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        id: "bvn-verification-failed",
        title: "Verification Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="container max-w-md mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">BVN Verification</h1>
        <p className="text-gray-600">Enter your BVN to proceed with verification</p>
      </div>

      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Enter your BVN"
          value={bvn}
          onChange={(e) => setBvn(e.target.value)}
          className="text-lg"
          maxLength={11}
        />

        <Button
          onClick={handleVerify}
          disabled={loading || bvn.length !== 11}
          className="w-full bg-green-600 hover:bg-green-300 text-white hover:text-black"
        >
          {loading ? 'Verifying...' : 'Verify BVN'}
        </Button>
      </div>
    </motion.div>
  );
} 