import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface Wallet {
  currency: string;
  balance: string;
  available_balance: string;
  pending_balance: string;
}

export default function WalletOverview() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/wallet/${user?.id}`);
      if (!response.ok) {
        throw new Error('Unable to fetch wallet information');
      }
      
      const data = await response.json();
      setWallets(data.wallets || []);
    } catch (err) {
      console.error('Error fetching wallets:', err);
      setError('Unable to fetch wallet information. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchWallets();
      // Refresh wallet data every minute
      const interval = setInterval(fetchWallets, 60000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!wallets.length) {
    return (
      <Alert>
        <AlertDescription>No wallet information available.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {wallets.map((wallet) => (
        <Card key={wallet.currency} className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{wallet.currency}</h3>
            <span className="text-sm text-muted-foreground">Available</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold">{wallet.available_balance}</p>
            {parseFloat(wallet.pending_balance) > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Pending: {wallet.pending_balance}
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
} 