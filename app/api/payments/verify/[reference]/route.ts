// app/api/payments/verify/[reference]/route.ts
import { NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxClient } from '@/app/lib/services/quidax-client';
import { QUIDAX_CONFIG } from '@/app/lib/config/quidax';

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return Response.json({
        status: 'error',
        message: 'Reference parameter is required'
      }, { status: 400 });
    }

    const quidaxClient = new QuidaxClient(QUIDAX_CONFIG.apiKey);

    // Get trade status from Quidax
    const response = await quidaxClient.getTransactionStatus(reference);

    if (!response?.data) {
      throw new Error('Invalid response from Quidax');
    }

    // Map the status to our format
    const status = response.data.status;
    const paymentStatus = status === 'completed' ? 'success' : 
                         status === 'failed' ? 'failed' : 'pending';

    return Response.json({
      status: 'success',
      data: {
        reference,
        status: paymentStatus,
        raw_status: status
      }
    });
  } catch (error: any) {
    console.error('[Payment Verify API] Error:', error);
    return Response.json({
      status: 'error',
      message: error.message || 'Failed to verify payment'
    }, {
      status: error.status || 500
    });
  }
}