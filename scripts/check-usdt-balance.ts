import { QuidaxService, QuidaxWallet } from '@/app/lib/services/quidax';

async function checkUSDTBalance(userId: string) {
  try {
    // Use static method directly
    const response = await QuidaxService.getWallets(userId);
    const usdtWallet = response.data?.find((wallet: QuidaxWallet) => wallet.currency.toLowerCase() === 'usdt');
    
    if (!usdtWallet) {
      throw new Error('USDT wallet not found');
    }

    console.log('USDT Balance:', usdtWallet);
    return usdtWallet;
  } catch (error) {
    console.error('Error checking USDT balance:', error);
    throw error;
  }
}

// Example usage
const userId = process.argv[2];
if (!userId) {
  console.error('Please provide a user ID');
  process.exit(1);
}

checkUSDTBalance(userId)
  .then(() => process.exit(0))
  .catch(() => process.exit(1)); 