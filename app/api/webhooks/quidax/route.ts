//app/api/webhooks/quidax/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { QuidaxWebhookEventType } from '@/app/types/webhook';
import { QuidaxWalletService } from '@/app/lib/services/quidax-wallet';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const body = await request.json();
    const signature = request.headers.get('x-quidax-signature');

    console.log('[INFO] [Quidax Webhook] Received webhook:', {
      event: body.event,
      timestamp: body.timestamp,
      signature: `${signature?.substring(0, 10)}...`
    });

    // Verify webhook signature
    if (!signature || signature !== process.env.QUIDAX_WEBHOOK_SECRET) {
      console.error('[ERROR] [Quidax Webhook] Invalid webhook signature', signature);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = body.event as QuidaxWebhookEventType;
    const data = body.data;

    // Process different webhook events
    switch (event) {
      case 'swap_transaction.completed':
        // Update user's wallet balance
        const { user_id, from_currency, to_currency, from_amount, to_amount } = data;
        
        // Get user profile by Quidax ID
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('user_id, email')
          .eq('quidax_id', user_id)
          .single();

        if (!userProfile) {
          console.error('[ERROR] [Quidax Webhook] User profile not found for Quidax ID:', user_id);
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Create transaction record
        const { error: txError } = await supabase
          .from('transactions')
          .insert({
            user_id: userProfile.user_id,
            type: 'swap',
            status: 'completed',
            from_currency: from_currency.toUpperCase(),
            to_currency: to_currency.toUpperCase(),
            from_amount,
            to_amount,
            metadata: data
          });

        if (txError) {
          console.error('[ERROR] [Quidax Webhook] Failed to create transaction record:', txError);
          return NextResponse.json({ error: 'Failed to process transaction' }, { status: 500 });
        }

        // Send notification
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: userProfile.user_id,
            type: 'swap_completed',
            title: 'Swap Completed',
            message: `Successfully swapped ${from_amount} ${from_currency.toUpperCase()} to ${to_amount} ${to_currency.toUpperCase()}`,
            metadata: {
              from_currency,
              to_currency,
              from_amount,
              to_amount
            }
          });

        if (notifError) {
          console.error('[ERROR] [Quidax Webhook] Failed to create notification:', notifError);
        }

        return NextResponse.json({ status: 'success' });

      default:
        console.log('[INFO] [Quidax Webhook] Unhandled event type:', event);
        return NextResponse.json({ status: 'ignored' });
    }
  } catch (error) {
    console.error('[ERROR] [Quidax Webhook] Failed to process webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}