import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxClient } from '@/lib/services/quidax-client';
import { TradeTransaction } from '@/app/lib/services/tradeTransaction';
import { PaymentProcessorFactory } from '@/app/lib/services/payment/PaymentProcessorFactory';
import { handleApiError } from '@/app/lib/utils/errorHandling';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-quidax-signature');
    const payload = await request.json();
    const quidaxClient = QuidaxClient.getInstance();

    // Verify webhook signature
    if (!quidaxClient.verifyWebhookSignature(payload, signature || undefined)) {
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