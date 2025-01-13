// app/api/trades/execute/route.ts
import { NextResponse } from 'next/server';
import { QuidaxService } from '@/app/lib/services/quidax';
import { handleApiError } from '@/app/lib/utils/errorHandling';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const quidaxService = QuidaxService.getInstance();

    // Get quote first
    const quoteResponse = await quidaxService.createSwapQuotation({
      market: body.market,
      side: body.side,
      amount: body.amount,
      unit: body.unit
    });

    if (!quoteResponse.ok) {
      throw new Error('Failed to get swap quotation');
    }

    const quoteData = await quoteResponse.json();

    // Execute the swap
    const swapResponse = await quidaxService.confirmSwap({
      quote_id: quoteData.data.id,
      market: body.market,
      side: body.side,
      amount: body.amount,
      unit: body.unit
    });

    if (!swapResponse.ok) {
      throw new Error('Failed to execute swap');
    }

    const swapData = await swapResponse.json();
    return NextResponse.json(swapData);
  } catch (error) {
    return handleApiError(error);
  }
} 