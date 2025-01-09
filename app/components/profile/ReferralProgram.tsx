import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CopyIcon, CheckIcon, Users, Gift, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReferralProgramProps {
  referralCode: string;
  referralStats: {
    totalReferrals: number;
    activeReferrals: number;
    totalEarnings: number;
    pendingEarnings: number;
  };
  className?: string;
}

export function ReferralProgram({ referralCode, referralStats, className = '' }: ReferralProgramProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy referral link');
    }
  };

  const handleShare = async () => {
    try {
      const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
      await navigator.share({
        title: 'Join trustBank',
        text: `Use my referral code: ${referralCode}`,
        url: referralLink
      });
      toast.success('Referral link shared successfully');
    } catch (error) {
      // Fall back to copying if share is not supported
      handleCopy();
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Referral Program</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Referral Code
          </h3>
          <div className="flex space-x-2">
            <Input
              value={referralCode}
              readOnly
              className="font-mono bg-white dark:bg-gray-700"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="flex-shrink-0"
            >
              {copied ? (
                <CheckIcon className="h-4 w-4 text-green-500" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              className="flex-shrink-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Referrals</p>
                <p className="text-2xl font-bold">{referralStats.totalReferrals}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {referralStats.activeReferrals} active users
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Gift className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</p>
                <p className="text-2xl font-bold">₦{referralStats.totalEarnings.toLocaleString()}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              ₦{referralStats.pendingEarnings.toLocaleString()} pending
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="font-medium mb-2">How it works</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>• Share your referral code with friends</li>
            <li>• Earn 20% of their trading fees for 6 months</li>
            <li>• Your friends get 10% off their trading fees</li>
            <li>• No limit on number of referrals</li>
          </ul>
        </div>

        <Button className="w-full" variant="default">
          View Referral History
        </Button>
      </CardContent>
    </Card>
  );
} 