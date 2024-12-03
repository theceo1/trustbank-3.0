//app/api/transactions/swap.ts
import { prisma } from '@/app/lib/prisma';
import { transaction_type, transaction_status } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export const createSwapTransaction = async (
  senderId: string, 
  receiverId: string, 
  amount: number
) => {
  const result = await prisma.$transaction(async (tx) => {
    // Create trade record
    const trade = await tx.trade.create({
      data: {
        user_id: senderId,
        type: transaction_type.sell,
        currency: "USDT",
        amount: amount,
        rate: 1,
        status: transaction_status.pending,
        payment_method: "wallet",
        crypto_amount: amount,
        fiat_amount: amount
      }
    });

    // Create transaction records
    const [senderTx, receiverTx] = await Promise.all([
      tx.transaction.create({
        data: {
          id: uuidv4(),
          userId: senderId,
          type: transaction_type.sell,
          amount: -amount,
          status: transaction_status.pending,
          currency: "USDT",
          description: `USDT transfer to ${receiverId}`
        }
      }),
      tx.transaction.create({
        data: {
          id: uuidv4(),
          userId: receiverId,
          type: transaction_type.sell,
          amount: amount,
          status: transaction_status.pending,
          currency: "USDT",
          description: `USDT received from ${senderId}`
        }
      })
    ]);

    // Update wallets
    await Promise.all([
      tx.wallet.update({
        where: { id: senderId },
        data: {
          balance: { decrement: amount },
          pending_balance: { increment: amount }
        }
      }),
      tx.wallet.update({
        where: { id: receiverId },
        data: {
          pending_balance: { increment: amount }
        }
      })
    ]);

    return { trade, senderTx, receiverTx };
  });

  return result;
}