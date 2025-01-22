import { QuidaxService } from '@/app/lib/services/quidax';

async function getAdminWallet(currency: string) {
  try {
    const adminId = process.env.QUIDAX_ADMIN_ID;
    if (!adminId) {
      throw new Error('QUIDAX_ADMIN_ID environment variable is required');
    }

    const response = await QuidaxService.getWallet(adminId, currency);
    console.log(`${currency.toUpperCase()} Wallet Balance:`, response.data);
    return response.data;
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