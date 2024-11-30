import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TradeDetails } from '@/app/types/trade';

export default function SellForm() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('btc');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/trades/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency,
          payment_method: paymentMethod,
          type: 'sell'
        })
      });

      const data = await response.json();
      if (data.payment.redirect_url) {
        window.location.href = data.payment.redirect_url;
      } else {
        router.push(`/payment/${data.trade.id}`);
      }
    } catch (error) {
      console.error('Trade creation failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form implementation */}
    </form>
  );
} 