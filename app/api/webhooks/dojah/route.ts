// app/api/webhooks/dojah/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { logger } from '@/app/lib/logger';
import { DojahKYCWebhookResponse } from '@/app/types/dojah';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const webhookLogger = {
    info: (message: string, data?: any) => logger.info(`[Dojah Webhook] ${message}`, data),
    error: (message: string, data?: any) => logger.error(`[Dojah Webhook] ${message}`, data),
    warn: (message: string, data?: any) => logger.warn(`[Dojah Webhook] ${message}`, data)
  };

  try {
    const body: DojahKYCWebhookResponse = await request.json();
    
    webhookLogger.info('Received KYC webhook:', { 
      referenceId: body.reference_id,
      status: body.verification_status
    });

    // Extract user metadata if available
    const metadata = body.metadata || {};
    const userId = metadata.user_id;

    if (!userId) {
      webhookLogger.error('No user ID found in webhook metadata');
      return new NextResponse('Missing user ID', { status: 400 });
    }

    // Process verification result
    if (body.verification_status === 'Completed') {
      const isVerified = body.status && 
        body.data?.government_data?.data?.nin?.entity?.nin && 
        body.data?.selfie?.status;

      // Update user's KYC status
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          kyc_verified: isVerified,
          kyc_level: isVerified ? 1 : 0,
          kyc_status: isVerified ? 'verified' : 'failed',
          verification_ref: body.reference_id,
          kyc_documents: {
            nin: body.data?.government_data?.data?.nin?.entity?.nin,
            selfie_url: body.selfie_url,
            verification_data: {
              nin_data: body.data?.government_data?.data?.nin?.entity,
              selfie_verification: body.data?.selfie,
              reference_id: body.reference_id,
              verified_at: new Date().toISOString()
            }
          },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        webhookLogger.error('Error updating user KYC status:', updateError);
        return new NextResponse('Error updating user profile', { status: 500 });
      }

      webhookLogger.info('User KYC status updated:', {
        userId,
        isVerified,
        referenceId: body.reference_id
      });

      // Send notification to user
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'kyc_update',
          title: 'Identity Verification Update',
          message: isVerified 
            ? 'Your identity has been verified successfully! You can now start trading.'
            : 'Your identity verification was not successful. Please check your profile for details.',
          data: {
            status: isVerified ? 'verified' : 'failed',
            reference_id: body.reference_id
          }
        })
      });
    }

    webhookLogger.info('Webhook processed successfully');
    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    webhookLogger.error('Error processing webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 