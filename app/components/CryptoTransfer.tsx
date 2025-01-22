import { useState } from 'react';
import { QuidaxClient } from '@/lib/services/quidax-client';
import { toast } from 'react-hot-toast';

interface CryptoTransferProps {
  senderQuidaxId: string;
  receiverQuidaxId: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export default function CryptoTransfer({
  senderQuidaxId,
  receiverQuidaxId,
  onSuccess,
  onError
}: CryptoTransferProps) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('usdt');
  const [isLoading, setIsLoading] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const transferPromise = new Promise(async (resolve, reject) => {
      try {
        // Check sender's balance first
        const quidaxClient = QuidaxClient.getInstance();
        const balanceResponse = await quidaxClient.getWalletBalance(senderQuidaxId, currency);
        const availableBalance = parseFloat(balanceResponse.data.balance);
        const transferAmount = parseFloat(amount);

        if (transferAmount > availableBalance) {
          throw new Error('Insufficient balance');
        }

        // Perform transfer
        const transferResponse = await quidaxClient.transfer(
          senderQuidaxId,
          receiverQuidaxId,
          currency,
          amount
        );

        toast.success('Transfer successful!');
        onSuccess?.(transferResponse.data);
        resolve(transferResponse.data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Transfer failed';
        onError?.(error as Error);
        reject(errorMessage);
      } finally {
        setIsLoading(false);
      }
    });

    toast.promise(transferPromise, {
      loading: 'Processing transfer...',
      success: (data) => `Successfully transferred ${amount} ${currency.toUpperCase()}`,
      error: (err) => `Transfer failed: ${err}`
    });
  };

  return (
    <form onSubmit={handleTransfer} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="0.000001"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="0.00"
        />
      </div>

      <div>
        <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
          Currency
        </label>
        <select
          id="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="usdt">USDT</option>
          <option value="btc">BTC</option>
          <option value="eth">ETH</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading || !amount}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
          isLoading || !amount
            ? 'bg-indigo-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        }`}
      >
        {isLoading ? 'Processing...' : 'Transfer'}
      </button>
    </form>
  );
} 