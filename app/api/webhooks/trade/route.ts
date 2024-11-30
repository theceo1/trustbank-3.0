import { NextResponse } from 'next/server';
import { TradeService } from '@/app/lib/services/trade';
import { WebhookValidator } from '@/app/lib/services/webhookValidator';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const isValid = await WebhookValidator.validateQuidaxWebhook(req);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    await TradeService.handlePaymentWebhook(payload);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}