// app/api/webhooks/dojah/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { WebhookLogger } from '@/app/lib/services/webhookLogger';
import { DojahKYCWebhookResponse } from '@/app/types/dojah';

function determineVerificationTier(data: DojahKYCWebhookResponse): { tier: 1 | 2 | 3, verified: boolean } {
  const govData = data.data.government_data?.data;
  
  // Check for Tier 3 (Government ID)
  if (data.data.id?.data.id_data?.document_type === 'Government ID' || 
      data.data.id?.data.id_data?.document_type === 'International Passport') {
    return { tier: 3, verified: data.status };
  }
  
  // Check for Tier 2 (BVN)
  if (govData?.bvn?.entity.bvn) {
    return { tier: 2, verified: data.status };
  }
  
  // Default to Tier 1 (NIN & Selfie)
  return { tier: 1, verified: data.status };
}

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
      const { tier, verified } = determineVerificationTier(data);
      
      const verificationData = {
        nin: govData?.nin?.entity.nin,
        bvn: govData?.bvn?.entity.bvn,
        first_name: idData?.first_name || govData?.nin?.entity.firstname,
        last_name: idData?.last_name || govData?.nin?.entity.surname,
        date_of_birth: idData?.date_of_birth || govData?.nin?.entity.birthdate,
        verification_id: data.reference_id,
        document_type: idData?.document_type,
        raw_response: data
      };

      // Prepare update data based on tier
      const updateData: any = {
        [`tier${tier}_verified`]: verified,
        [`tier${tier}_verified_at`]: verified ? new Date().toISOString() : null,
        [`tier${tier}_data`]: verificationData,
        last_verification_attempt: new Date().toISOString()
      };

      // If it's tier 1 and verified, update the basic KYC status
      if (tier === 1 && verified) {
        updateData.kyc_status = 'verified';
        updateData.kyc_level = 1;
        updateData.is_verified = true;
      }

      // Update user's verification status
      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('verification_ref', data.reference_id);

      if (error) {
        console.error('Error updating user profile:', {
          error,
          tier,
          verified,
          reference_id: data.reference_id
        });
        throw error;
      }

      // Log successful verification
      console.log('Verification completed:', {
        tier,
        verified,
        reference_id: data.reference_id,
        verification_data: verificationData
      });
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