import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxService } from '@/app/lib/services/quidax';
import { TradeTransaction } from '@/app/lib/services/tradeTransaction';
import { PaymentProcessorFactory } from '@/app/lib/services/payment/PaymentProcessorFactory';
import { handleApiError } from '@/app/lib/utils/errorHandling';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-quidax-signature');
    const payload = await request.json();
    const quidaxService = QuidaxService.getInstance();

    // Verify webhook signature
    if (!quidaxService.verifyWebhookSignature(payload, signature || undefined)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Process the webhook payload
    const { event, data } = payload;
    console.log(`Processing ${event} webhook:`, data);

    // Handle different webhook events
    switch (event) {
      case 'transfer.success':
        // Handle successful transfer
        break;
      case 'transfer.failed':
        // Handle failed transfer
        break;
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    return handleApiError(error);
  }
}