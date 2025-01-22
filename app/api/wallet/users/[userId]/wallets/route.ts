import { NextResponse } from 'next/server';
import { QuidaxClient } from '@/lib/services/quidax-client';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const quidax = QuidaxClient.getInstance();
    const response = await quidax.fetchUserWallets(params.userId);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user wallets:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch user wallets' },
      { status: 500 }
    );
  }
} 