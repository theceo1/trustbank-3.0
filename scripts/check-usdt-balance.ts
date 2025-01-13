import { QuidaxService } from '@/app/lib/services/quidax';

async function checkUSDTBalance(userId: string) {
  try {
    const quidaxService = QuidaxService.getInstance();
    const response = await quidaxService.getWalletBalance(userId, 'usdt');

    if (!response.ok) {
      throw new Error('Failed to fetch USDT balance');
    }

    const data = await response.json();
    console.log('USDT Balance:', data);
    return data;
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