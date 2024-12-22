import { QuidaxService } from '@/app/lib/services/quidax';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const segments = request.url.split('/');
    const userId = segments[segments.length - 1];
    const currencies = ['NGN', 'BTC', 'ETH', 'USDT', 'USDC'];
    
    const wallets = await Promise.all(
      currencies.map(async (currency) => {
        try {
          return await QuidaxService.getWalletInfo(userId, currency);
        } catch (error) {
          return {
            currency,
            balance: '0',
            pending: '0'
          };
        }
      })
    );

    return NextResponse.json(wallets);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    return NextResponse.json({ error: 'Failed to fetch wallets' }, { status: 500 });
  }
}