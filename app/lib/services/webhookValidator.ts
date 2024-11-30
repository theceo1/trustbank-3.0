import { createHmac } from 'crypto';
import { headers } from 'next/headers';

export class WebhookValidator {
  static async validateQuidaxWebhook(request: Request): Promise<boolean> {
    const headersList = await headers();
    const signature = headersList.get('x-quidax-signature');
    if (!signature) return false;

    const payload = await request.json();
    const computedSignature = createHmac('sha256', process.env.QUIDAX_WEBHOOK_SECRET!)
      .update(JSON.stringify(payload))
      .digest('hex');

    return signature === computedSignature;
  }
}