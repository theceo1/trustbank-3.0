// app/api/payments/verify/[reference]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { QuidaxService } from '@/app/lib/services/quidax';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');

  if (!reference) {
    return NextResponse.json({ error: 'Reference parameter is required' }, { status: 400 });
  }

  try {
    // Call the QuidaxService to check the payment status
    const paymentStatus = await QuidaxService.checkPaymentStatus(reference);

    // Return the payment status
    return NextResponse.json({ status: 'success', paymentStatus });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}