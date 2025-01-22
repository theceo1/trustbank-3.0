import { QuidaxService } from '@/app/lib/services/quidax';

interface TransferParams {
  fromUserId: string;
  toUserId: string;
  amount: string;
}

async function transferUSDT({ fromUserId, toUserId, amount }: TransferParams) {
  try {
    // Check source wallet balance
    console.log('Checking source USDT balance...');
    const sourceWallet = await QuidaxService.getWallet(fromUserId, 'usdt');
    console.log('Source USDT balance:', sourceWallet.data[0]?.balance || '0');

    // Verify sufficient balance
    const currentBalance = parseFloat(sourceWallet.data[0]?.balance || '0');
    const transferAmount = parseFloat(amount);
    if (currentBalance < transferAmount) {
      throw new Error(`Insufficient balance. Required: ${amount}, Available: ${currentBalance}`);
    }

    // Transfer USDT
    console.log('Initiating USDT transfer...');
    const transferResponse = await QuidaxService.transfer(
      fromUserId,
      toUserId,
      amount,
      'usdt'
    );
    console.log('Transfer completed:', transferResponse.data);

    // Check final balances
    console.log('Checking final balances...');
    const finalSourceWallet = await QuidaxService.getWallet(fromUserId, 'usdt');
    const finalDestWallet = await QuidaxService.getWallet(toUserId, 'usdt');

    console.log('Final source USDT balance:', finalSourceWallet.data[0]?.balance || '0');
    console.log('Final destination USDT balance:', finalDestWallet.data[0]?.balance || '0');

    return {
      transfer: transferResponse.data,
      finalBalances: {
        source: finalSourceWallet.data[0]?.balance || '0',
        destination: finalDestWallet.data[0]?.balance || '0'
      }
    };
  } catch (error) {
    console.error('Error in USDT transfer:', error);
    throw error;
  }
}

// Example usage
const fromUserId = process.argv[2];
const toUserId = process.argv[3];
const amount = process.argv[4];

if (!fromUserId || !toUserId || !amount) {
  console.error('Usage: ts-node transfer-usdt-to-receiver.ts <fromUserId> <toUserId> <amount>');
  process.exit(1);
}

transferUSDT({ fromUserId, toUserId, amount })
  .then(() => process.exit(0))
  .catch(() => process.exit(1)); 