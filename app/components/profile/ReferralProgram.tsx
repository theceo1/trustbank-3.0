import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReferralProgramProps {
  referralCode: string | null;
  referralStats: {
    totalReferrals: number;
    activeReferrals: number;
    totalEarnings: number;
    pendingEarnings: number;
  };
  className?: string;
  onGenerateCode?: () => void;
}

export function ReferralProgram({ referralCode, referralStats, className, onGenerateCode }: ReferralProgramProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const copyToClipboard = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Referral code copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy referral code',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateCode = async () => {
    if (!onGenerateCode) return;
    setIsGenerating(true);
    try {
      await onGenerateCode();
      toast({
        title: 'Success!',
        description: 'Your referral code has been generated.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to generate referral code',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!referralCode) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Referral Code</h3>
            <p className="text-gray-500 mb-4">
              Generate your referral code to start earning rewards when friends join and trade.
            </p>
            <Button
              onClick={handleGenerateCode}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Referral Code'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Referral Program</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Your Referral Code</h3>
            <div className="flex items-center space-x-2">
              <Input
                readOnly
                value={referralCode}
                className="font-mono bg-gray-50 dark:bg-gray-800"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
                className="flex-shrink-0"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Share your referral code with friends and earn rewards when they sign up and trade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {referralStats.totalReferrals}
                  </div>
                  <p className="text-sm text-gray-500">Total Referrals</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {referralStats.activeReferrals}
                  </div>
                  <p className="text-sm text-gray-500">Active Referrals</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ₦{referralStats.totalEarnings.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">Total Earnings</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    ₦{referralStats.pendingEarnings.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">Pending Earnings</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 