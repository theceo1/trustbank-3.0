import { NextResponse } from 'next/server';
import { QuidaxClient } from '@/app/lib/quidax';

export async function GET(
  request: Request,
  { params }: { params: { market: string } }
) {
  try {
    const quidax = new QuidaxClient();
    const response = await quidax.get(`/markets/${params.market}/order_book?ask_limit=20&bids_limit=20`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch order book');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching order book:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 