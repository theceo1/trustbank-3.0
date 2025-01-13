import { QuidaxService } from '@/app/lib/services/quidax';

async function getAdminWallet(currency: string) {
  try {
    const adminId = process.env.QUIDAX_ADMIN_ID;
    if (!adminId) {
      throw new Error('QUIDAX_ADMIN_ID environment variable is required');
    }

    const quidaxService = QuidaxService.getInstance();
    const response = await quidaxService.getWalletBalance(adminId, currency);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${currency} wallet balance`);
    }

    const data = await response.json();
    console.log(`${currency.toUpperCase()} Wallet Balance:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching admin wallet:', error);
    throw error;
  }
}

// Example usage
const currency = process.argv[2]?.toLowerCase() || 'usdt';
getAdminWallet(currency)
  .then(() => process.exit(0))
  .catch(() => process.exit(1)); 