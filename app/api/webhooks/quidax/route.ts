//app/api/webhooks/quidax/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { WebhookLogger } from '@/app/lib/services/webhookLogger';
import { QuidaxWebhookService } from '@/app/lib/services/quidax-webhook.service';
import crypto from 'crypto';

function verifySignature(payload: string, headers: Headers) {
  const signature = headers.get('quidax-signature');
  if (!signature || !process.env.QUIDAX_WEBHOOK_SECRET) return false;

  const [timestampSection, signatureSection] = signature.split(',');
  const [, timestamp] = timestampSection.split('=');
  const [, sig] = signatureSection.split('=');

  const computedSignature = crypto
    .createHmac('sha256', process.env.QUIDAX_WEBHOOK_SECRET)
    .update(`${timestamp}.${payload}`)
    .digest('hex');

  return sig === computedSignature;
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    
    if (!verifySignature(payload, req.headers)) {
      return new NextResponse('Invalid signature', { status: 401 });
    }

    await WebhookLogger.logWebhook('quidax', JSON.parse(payload));
    
    const webhookService = new QuidaxWebhookService();
    await webhookService.handleWebhook(JSON.parse(payload));

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}