import { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { QuidaxService } from '@/app/lib/services/quidax';
import CryptoTransfer from '@/app/components/CryptoTransfer';
import { Toaster } from 'react-hot-toast';

interface WalletBalance {
  currency: string;
  balance: string;
}

interface UserProfile {
  quidax_id: string;
}

export default function TransferPage() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [receiverQuidaxId, setReceiverQuidaxId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const fetchBalances = async () => {
    if (!session?.user?.id) return;

    try {
      if (!userProfile) {
        // Fetch user's Quidax ID from profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('quidax_id')
          .eq('user_id', session.user.id)
          .single();

        if (!profile?.quidax_id) {
          throw new Error('Quidax ID not found');
        }

        setUserProfile(profile);
      }

      // Fetch balances for major cryptocurrencies
      const currencies = ['usdt', 'btc', 'eth'];
      const balancePromises = currencies.map(async (currency) => {
        const response = await QuidaxService.getWalletBalance(userProfile?.quidax_id || '', currency);
        if (!response.ok) return null;
        const data = await response.json();
        return {
          currency: currency.toUpperCase(),
          balance: data.data[0]?.balance || '0'
        };
      });

      const results = await Promise.all(balancePromises);
      setBalances(results.filter((b): b is WalletBalance => b !== null));
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [session]);

  const handleTransferSuccess = async () => {
    // Refresh balances after successful transfer
    if (session?.user?.id) {
      setIsLoading(true);
      await fetchBalances();
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Please sign in to access this page</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Crypto Transfer
            </h1>

            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Your Balances</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {balances.map((balance) => (
                      <div
                        key={balance.currency}
                        className="bg-gray-50 px-4 py-5 shadow rounded-lg text-center"
                      >
                        <dt className="text-sm font-medium text-gray-500">
                          {balance.currency}
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                          {parseFloat(balance.balance).toFixed(6)}
                        </dd>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="max-w-md mx-auto">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Transfer Crypto
                  </h2>
                  
                  <div className="mb-4">
                    <label htmlFor="receiverQuidaxId" className="block text-sm font-medium text-gray-700">
                      Receiver's Quidax ID
                    </label>
                    <input
                      type="text"
                      id="receiverQuidaxId"
                      value={receiverQuidaxId}
                      onChange={(e) => setReceiverQuidaxId(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Enter receiver's Quidax ID"
                      required
                    />
                  </div>

                  {session?.user?.id && receiverQuidaxId && userProfile && (
                    <CryptoTransfer
                      senderQuidaxId={userProfile.quidax_id}
                      receiverQuidaxId={receiverQuidaxId}
                      onSuccess={handleTransferSuccess}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 