// app/api/trades/execute/route.ts
import { NextResponse } from 'next/server';
import { handleTransactionError } from '@/lib/utils/error-handler';
import { QuidaxSwapService } from '@/lib/services/quidax-swap';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Get quote first
    const { data: quoteData } = await QuidaxSwapService.createSwapQuotation({
      user_id: body.user_id || 'me',
      from_currency: body.from_currency,
      to_currency: body.to_currency,
      from_amount: body.from_amount,
    });

    // Execute the swap
    const { data: swapData, error } = await QuidaxSwapService.confirmSwap(body.user_id || 'me', quoteData.id);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data: swapData });
  } catch (error) {
    const txError = handleTransactionError(error);
    return NextResponse.json({ error: txError }, { status: txError.status });
  }
} 