//app/api/transactions/swap.ts
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type TransactionType = 'buy' | 'sell';
type TransactionStatus = 'pending' | 'completed' | 'failed';

export const createSwapTransaction = async (
  senderId: string, 
  receiverId: string, 
  amount: number
) => {
  // Create trade record
  const { data: trade, error: tradeError } = await supabase
    .from('trades')
    .insert({
      user_id: senderId,
      type: 'sell' as TransactionType,
      currency: "USDT",
      amount: amount,
      rate: 1,
      status: 'pending' as TransactionStatus,
      payment_method: "wallet",
      crypto_amount: amount,
      fiat_amount: amount
    })
    .select()
    .single();

  if (tradeError) throw tradeError;

  // Create transaction records
  const [senderTxResult, receiverTxResult] = await Promise.all([
    supabase
      .from('transactions')
      .insert({
        id: uuidv4(),
        user_id: senderId,
        type: 'sell' as TransactionType,
        amount: -amount,
        status: 'pending' as TransactionStatus,
        currency: "USDT",
        description: `USDT transfer to ${receiverId}`
      })
      .select()
      .single(),
    supabase
      .from('transactions')
      .insert({
        id: uuidv4(),
        user_id: receiverId,
        type: 'sell' as TransactionType,
        amount: amount,
        status: 'pending' as TransactionStatus,
        currency: "USDT",
        description: `USDT received from ${senderId}`
      })
      .select()
      .single()
  ]);

  if (senderTxResult.error) throw senderTxResult.error;
  if (receiverTxResult.error) throw receiverTxResult.error;

  // Update wallets using RPC function
  const [senderUpdate, receiverUpdate] = await Promise.all([
    supabase.rpc('update_wallet_balance', {
      p_user_id: senderId,
      p_currency: 'usdt',
      p_amount: -amount
    }),
    supabase.rpc('update_wallet_balance', {
      p_user_id: receiverId,
      p_currency: 'usdt',
      p_amount: amount
    })
  ]);

  if (senderUpdate.error) throw senderUpdate.error;
  if (receiverUpdate.error) throw receiverUpdate.error;

  return {
    trade: trade,
    senderTx: senderTxResult.data,
    receiverTx: receiverTxResult.data
  };
};