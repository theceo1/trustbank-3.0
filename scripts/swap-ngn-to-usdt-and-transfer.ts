import { QuidaxService } from '@/app/lib/services/quidax';

interface SwapParams {
  fromUserId: string;
  toUserId: string;
  amount: string;
}

async function swapAndTransfer({ fromUserId, toUserId, amount }: SwapParams) {
  try {
    // Check source wallet balance
    console.log('Checking source wallet balance...');
    const sourceResponse = await QuidaxService.getWallet(fromUserId, 'ngn');
    if (!sourceResponse.data) {
      throw new Error('Failed to fetch source wallet balance');
    }
    const sourceWallet = sourceResponse.data;
    console.log('Source NGN balance:', sourceWallet[0]?.balance || '0');

    // Create swap quotation
    console.log('Creating swap quotation...');
    const quote = await QuidaxService.createSwapQuotation({
      market: 'usdtngn',
      side: 'buy',
      amount,
      unit: 'ngn'
    });

    if (!quote.data) {
      throw new Error('Failed to get swap quotation');
    }
    console.log('Swap quote received:', quote.data);

    // Execute the swap
    console.log('Executing swap...');
    const swap = await QuidaxService.confirmSwap({
      quote_id: quote.data.id,
      market: 'usdtngn',
      side: 'buy',
      amount,
      unit: 'ngn'
    });

    if (!swap.data) {
      throw new Error('Failed to execute swap');
    }
    console.log('Swap executed:', swap.data);

    // Check updated USDT balance
    console.log('Checking updated USDT balance...');
    const updatedSourceResponse = await QuidaxService.getWallet(fromUserId, 'usdt');
    if (!updatedSourceResponse.data) {
      throw new Error('Failed to fetch updated USDT balance');
    }
    const updatedSourceWallet = updatedSourceResponse.data;
    console.log('Updated USDT balance:', updatedSourceWallet[0]?.balance || '0');

    // Transfer USDT to receiver
    console.log('Transferring USDT to receiver...');
    const transferResponse = await QuidaxService.transfer(
      fromUserId,
      toUserId,
      swap.data.to_amount,
      'usdt'
    );

    if (!transferResponse.data) {
      throw new Error('Failed to transfer USDT');
    }
    const transfer = transferResponse;
    console.log('Transfer completed:', transfer.data);

    // Final balance check
    console.log('Checking final balances...');
    const finalSourceResponse = await QuidaxService.getWallet(fromUserId, 'usdt');
    const finalDestResponse = await QuidaxService.getWallet(toUserId, 'usdt');

    if (!finalSourceResponse.data || !finalDestResponse.data) {
      throw new Error('Failed to fetch final balances');
    }

    const finalSourceWallet = finalSourceResponse.data;
    const finalDestWallet = finalDestResponse.data;

    console.log('Final source USDT balance:', finalSourceWallet[0]?.balance || '0');
    console.log('Final destination USDT balance:', finalDestWallet[0]?.balance || '0');

    return {
      swap: swap.data,
      transfer: transfer.data,
      finalBalances: {
        source: finalSourceWallet[0]?.balance || '0',
        destination: finalDestWallet[0]?.balance || '0'
      }
    };
  } catch (error) {
    console.error('Error in swap and transfer:', error);
    throw error;
  }
}

// Example usage
const fromUserId = process.argv[2];
const toUserId = process.argv[3];
const amount = process.argv[4];

if (!fromUserId || !toUserId || !amount) {
  console.error('Usage: ts-node swap-ngn-to-usdt-and-transfer.ts <fromUserId> <toUserId> <amount>');
  process.exit(1);
}

swapAndTransfer({ fromUserId, toUserId, amount })
  .then(() => process.exit(0))
  .catch(() => process.exit(1)); 