import { QuidaxService } from '@/app/lib/services/quidax';

interface SwapParams {
  fromUserId: string;
  toUserId: string;
  amount: string;
}

async function swapAndTransfer({ fromUserId, toUserId, amount }: SwapParams) {
  try {
    const quidaxService = QuidaxService.getInstance();

    // Check source wallet balance
    console.log('Checking source wallet balance...');
    const sourceResponse = await quidaxService.getWalletBalance(fromUserId, 'ngn');
    if (!sourceResponse.ok) {
      throw new Error('Failed to fetch source wallet balance');
    }
    const sourceWallet = await sourceResponse.json();
    console.log('Source NGN balance:', sourceWallet.data[0]?.balance || '0');

    // Create swap quotation
    console.log('Creating swap quotation...');
    const quoteResponse = await quidaxService.createSwapQuotation({
      market: 'usdtngn',
      side: 'buy',
      amount,
      unit: 'ngn'
    });

    if (!quoteResponse.ok) {
      throw new Error('Failed to get swap quotation');
    }
    const quote = await quoteResponse.json();
    console.log('Swap quote received:', quote.data);

    // Execute the swap
    console.log('Executing swap...');
    const swapResponse = await quidaxService.confirmSwap({
      quote_id: quote.data.id,
      market: 'usdtngn',
      side: 'buy',
      amount,
      unit: 'ngn'
    });

    if (!swapResponse.ok) {
      throw new Error('Failed to execute swap');
    }
    const swap = await swapResponse.json();
    console.log('Swap executed:', swap.data);

    // Check updated USDT balance
    console.log('Checking updated USDT balance...');
    const updatedSourceResponse = await quidaxService.getWalletBalance(fromUserId, 'usdt');
    if (!updatedSourceResponse.ok) {
      throw new Error('Failed to fetch updated USDT balance');
    }
    const updatedSourceWallet = await updatedSourceResponse.json();
    console.log('Updated USDT balance:', updatedSourceWallet.data[0]?.balance || '0');

    // Transfer USDT to receiver
    console.log('Transferring USDT to receiver...');
    const transferResponse = await quidaxService.transfer(
      fromUserId,
      toUserId,
      swap.data.destination_amount,
      'usdt'
    );

    if (!transferResponse.ok) {
      throw new Error('Failed to transfer USDT');
    }
    const transfer = await transferResponse.json();
    console.log('Transfer completed:', transfer.data);

    // Final balance check
    console.log('Checking final balances...');
    const finalSourceResponse = await quidaxService.getWalletBalance(fromUserId, 'usdt');
    const finalDestResponse = await quidaxService.getWalletBalance(toUserId, 'usdt');

    if (!finalSourceResponse.ok || !finalDestResponse.ok) {
      throw new Error('Failed to fetch final balances');
    }

    const finalSourceWallet = await finalSourceResponse.json();
    const finalDestWallet = await finalDestResponse.json();

    console.log('Final source USDT balance:', finalSourceWallet.data[0]?.balance || '0');
    console.log('Final destination USDT balance:', finalDestWallet.data[0]?.balance || '0');

    return {
      swap: swap.data,
      transfer: transfer.data,
      finalBalances: {
        source: finalSourceWallet.data[0]?.balance || '0',
        destination: finalDestWallet.data[0]?.balance || '0'
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