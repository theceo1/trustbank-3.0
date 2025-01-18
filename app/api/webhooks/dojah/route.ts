// app/api/webhooks/dojah/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { logger } from '@/app/lib/logger';
import { DojahKYCWebhookResponse } from '@/app/types/dojah';
import { KYCTier } from '@/app/types/kyc';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
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
    const verificationType = metadata.verification_type || 'nin';

    if (!userId) {
      webhookLogger.error('No user ID found in webhook metadata');
      return new NextResponse('Missing user ID', { status: 400 });
    }

    // Process verification result
    if (body.verification_status === 'Completed') {
      const isVerified = body.status && 
        (verificationType === 'nin' ? 
          body.data?.government_data?.data?.nin?.entity?.nin && body.data?.selfie?.status :
          verificationType === 'bvn' ?
          body.data?.government_data?.data?.bvn?.entity?.bvn :
          body.data?.id?.status && body.data?.selfie?.status);

      // Get current KYC level
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('kyc_level')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        webhookLogger.error('Error fetching user profile:', profileError);
        return new NextResponse('Error fetching user profile', { status: 500 });
      }

      // Determine new KYC level based on verification type
      let newKycLevel = profileData.kyc_level;
      if (isVerified) {
        switch (verificationType) {
          case 'nin':
            newKycLevel = KYCTier.BASIC;
            break;
          case 'bvn':
            newKycLevel = KYCTier.INTERMEDIATE;
            break;
          case 'photo_id':
            newKycLevel = KYCTier.ADVANCED;
            break;
        }
      }

      // Update user profile with verification result
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          kyc_level: newKycLevel,
          kyc_status: isVerified ? 'approved' : 'rejected',
          is_verified: isVerified,
          kyc_documents: {
            ...body.data,
            verification_type: verificationType,
            updated_at: new Date().toISOString()
          }
        })
        .eq('user_id', userId);

      if (updateError) {
        webhookLogger.error('Error updating user profile:', updateError);
        return new NextResponse('Error updating user profile', { status: 500 });
      }

      // Create a verification log entry
      const { error: logError } = await supabase
        .from('verification_logs')
        .insert({
          user_id: userId,
          verification_type: verificationType,
          status: isVerified ? 'success' : 'failed',
          reference: body.reference_id,
          metadata: {
            verification_data: body.data,
            selfie_url: body.selfie_url,
            kyc_level: newKycLevel
          }
        });

      if (logError) {
        webhookLogger.error('Error creating verification log:', logError);
      }

      webhookLogger.info('Verification status updated:', {
        userId,
        isVerified,
        newKycLevel,
        verificationType
      });
    }

    webhookLogger.info('Webhook processed successfully');
    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    webhookLogger.error('Error processing webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 