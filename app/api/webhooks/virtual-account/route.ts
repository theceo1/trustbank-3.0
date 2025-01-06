import { NextResponse } from 'next/server';
import { VirtualAccountService } from '@/app/lib/services/virtual-account';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Get headers using the correct Next.js headers API
    const headersList = headers();
    const signature = request.headers.get('x-wema-signature') ?? '';
    
    if (!signature) {
      console.error('Missing webhook signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    const payload = await request.json();
    console.log('Received virtual account webhook:', payload);

    const virtualAccountService = VirtualAccountService.getInstance();
    await virtualAccountService.handleWebhook(payload, signature);

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Virtual account webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 