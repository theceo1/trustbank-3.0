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
    // Get trade status from Quidax
    const status = await QuidaxService.getTradeStatus(reference);
    
    // Map the status to our format
    const paymentStatus = QuidaxService.mapQuidaxStatus(status);

    return NextResponse.json({ 
      status: 'success', 
      paymentStatus 
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}