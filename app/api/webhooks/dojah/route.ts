// app/api/webhooks/dojah/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { WebhookLogger } from '@/app/lib/services/webhookLogger';
import { DojahKYCWebhookResponse } from '@/app/types/dojah';

export async function POST(request: Request) {
  let webhookLogId: string | undefined;

  try {
    // Verify webhook signature
    const signature = request.headers.get('x-dojah-signature');
    if (!signature || signature !== process.env.DOJAH_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = await request.json() as DojahKYCWebhookResponse;
    const supabase = createRouteHandlerClient({ cookies });

    // Log webhook received
    const { data: logEntry } = await supabase
      .from('webhook_logs')
      .insert({
        type: 'dojah',
        payload: data,
        status: 'received',
        reference_id: data.reference_id
      })
      .select()
      .single();

    webhookLogId = logEntry?.id;

    if (data.verification_status === 'Completed') {
      const govData = data.data.government_data?.data;
      const idData = data.data.id?.data.id_data;
      
      const verificationData = {
        nin: govData?.nin?.entity.nin,
        bvn: govData?.bvn?.entity.bvn,
        first_name: idData?.first_name || govData?.nin?.entity.firstname,
        last_name: idData?.last_name || govData?.nin?.entity.surname,
        date_of_birth: idData?.date_of_birth || govData?.nin?.entity.birthdate,
        verification_id: data.reference_id,
        raw_response: data
      };

      // Update user's verification status
      const { error } = await supabase
        .from('user_profiles')
        .update({
          kyc_status: data.status ? 'verified' : 'failed',
          kyc_level: data.status ? 1 : 0,
          last_verification_at: new Date().toISOString(),
          kyc_data: verificationData
        })
        .eq('verification_ref', data.reference_id);

      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }
    }

    if (webhookLogId) {
      await WebhookLogger.updateWebhookStatus(webhookLogId, 'processed');
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    if (webhookLogId) {
      await WebhookLogger.updateWebhookStatus(
        webhookLogId, 
        'failed', 
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
} 