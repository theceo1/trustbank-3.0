//app/trade/page.tsx
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ErrorBoundary } from '@/app/components/error-boundary';
import { TradeDetails } from '@/app/types/trade';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

// Import components normally since they're properly typed
import { QuickTrade } from './components/QuickTrade';
import { MarketStats } from './components/MarketStats';
import OrderBook from './components/OrderBook';
import { TradeHistory } from './components/TradeHistory';
import TradePreview from './components/TradePreview';
import TradeReceipt from './components/TradeReceipt';
import Announcements from '@/components/dashboard/Announcements';
import { ReferralProgram } from '@/components/profile/ReferralProgram';
import { AccountBalance } from '@/components/dashboard/AccountBalance';

export default function TradePage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [hasQuidaxId, setHasQuidaxId] = useState(false);
  const [trades, setTrades] = useState<TradeDetails[]>([]);
  const [showTradePreview, setShowTradePreview] = useState(false);
  const [showTradeReceipt, setShowTradeReceipt] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<TradeDetails | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0
  });

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        if (!user?.id) return;

        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('is_verified, quidax_id, referral_code')
          .eq('user_id', user.id)
          .single();

        if (profileError) throw profileError;

        setProfile(profile);
        setIsVerified(profile?.is_verified || false);
        setHasQuidaxId(!!profile?.quidax_id);
      } catch (error) {
        console.error('Error checking user status:', error);
        toast({
          title: "Error",
          description: "Failed to load user status",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, [user?.id, supabase, toast]);

  const handleTradePreview = (trade: TradeDetails) => {
    setSelectedTrade(trade);
    setShowTradePreview(true);
  };

  const handleTradeConfirm = () => {
    setShowTradePreview(false);
    setShowTradeReceipt(true);
  };

  const handleTradeClose = () => {
    setShowTradePreview(false);
    setShowTradeReceipt(false);
    setSelectedTrade(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Verification Required</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please complete your account verification to access trading features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasQuidaxId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Quidax Account Required</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please link your Quidax account to access trading features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Announcements Section */}
      <ErrorBoundary>
        <Announcements isVerified={isVerified} />
      </ErrorBoundary>

      {!isVerified && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Account Verification Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>
                  To ensure the security of your transactions and comply with regulations, please complete your account verification.
                  This will unlock all trading features including:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Cryptocurrency trading</li>
                  <li>Fiat deposits and withdrawals</li>
                  <li>Higher transaction limits</li>
                </ul>
                <div className="mt-4">
                  <Link
                    href="/profile/verification"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Complete Verification
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Trade & Wallet Balance */}
        <div className="lg:col-span-1 space-y-8">
          <ErrorBoundary>
            <AccountBalance />
          </ErrorBoundary>
          
          <ErrorBoundary>
            <QuickTrade onTradePreview={handleTradePreview} />
          </ErrorBoundary>
          
          {/* Referral Program */}
          <ErrorBoundary>
            <ReferralProgram 
              referralCode={profile?.referral_code === undefined ? null : profile.referral_code}
              referralStats={referralStats}
              onGenerateCode={async () => {
                toast({
                  title: "Coming Soon",
                  description: "Referral code generation will be available soon."
                });
              }}
            />
          </ErrorBoundary>
        </div>

        {/* Right Column - Market Stats & Order Book */}
        <div className="lg:col-span-2 space-y-8">
          <ErrorBoundary>
            <MarketStats />
          </ErrorBoundary>
          <ErrorBoundary>
            <OrderBook market="btcngn" />
          </ErrorBoundary>
        </div>
      </div>

      {/* Trade History Section */}
      <ErrorBoundary>
        <Card className="bg-white dark:bg-gray-800/50 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold dark:text-white">Trade History</CardTitle>
          </CardHeader>
          <CardContent>
            <TradeHistory trades={trades} onTradeSelect={handleTradePreview} />
          </CardContent>
        </Card>
      </ErrorBoundary>

      {/* Trade Preview Modal */}
      {showTradePreview && selectedTrade && (
        <TradePreview
          trade={selectedTrade}
          onConfirm={handleTradeConfirm}
          onClose={handleTradeClose}
        />
      )}

      {/* Trade Receipt Modal */}
      {showTradeReceipt && selectedTrade && (
        <TradeReceipt
          trade={selectedTrade}
          onClose={handleTradeClose}
        />
      )}
    </div>
  );
}