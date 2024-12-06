import { QuidaxService } from './services/quidax';
import debug from 'debug';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const log = debug('trade:withdraw');

interface WithdrawParams {
  amount: string;
  address: string;
  network: 'bep20' | 'trc20' | 'erc20';
  transaction_note?: string;
  narration?: string;
}

async function withdrawUSDT({ 
  amount, 
  address, 
  network, 
  transaction_note = 'USDT Withdrawal',
  narration = 'USDT Withdrawal' 
}: WithdrawParams) {
  try {
    const adminId = 'bf1b9627-f749-4bfc-be9f-9e37254f461d';

    // First check balance
    const walletInfo = await QuidaxService.checkWalletBalance(adminId, 'usdt');
    log('Current wallet balance:', walletInfo.balance);

    // Verify sufficient balance (including potential fees)
    const totalAmount = parseFloat(amount);
    const currentBalance = parseFloat(walletInfo.balance);
    
    if (currentBalance < totalAmount) {
      throw new Error(`Insufficient balance. Required: ${totalAmount}, Available: ${currentBalance}`);
    }

    // Initiate withdrawal
    const withdrawal = await QuidaxService.withdrawCrypto({
      user_id: adminId,
      currency: 'usdt',
      amount: amount,
      recipient_address: address,
      network: network,
      transaction_note,
      narration
    });

    log('Withdrawal initiated:', withdrawal);

    // Monitor withdrawal status
    const checkStatus = async () => {
      const status = await QuidaxService.getWithdrawalStatus(adminId, withdrawal.id);
      log('Withdrawal status:', status.status);
      return status;
    };

    // Check status immediately
    const finalStatus = await checkStatus();

    return {
      withdrawal: finalStatus,
      previousBalance: walletInfo.balance,
      currentBalance: (await QuidaxService.checkWalletBalance(adminId, 'usdt')).balance
    };
  } catch (error) {
    log('Withdrawal failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const withdrawalParams: WithdrawParams = {
    amount: '0.59',
    address: '0xe162A77E41735C504CFa35d60AB16275C5c1221f',
    network: 'bep20',
    transaction_note: 'Test withdrawal',
    narration: 'Test withdrawal'
  };

  withdrawUSDT(withdrawalParams)
    .then(result => {
      console.log('Withdrawal Result:', {
        status: result.withdrawal.status,
        txid: result.withdrawal.txid,
        amount: result.withdrawal.amount,
        fee: result.withdrawal.fee,
        previousBalance: result.previousBalance,
        currentBalance: result.currentBalance
      });
    })
    .catch(error => {
      console.error('Error:', error.message);
      if (error.response?.data) {
        console.error('API Error:', error.response.data);
      }
    });
}