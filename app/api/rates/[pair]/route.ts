import { MarketRateService } from '@/app/lib/services/market-rate';

export async function GET(
  request: Request,
  { params }: { params: { pair: string } }
) {
  try {
    const rate = await MarketRateService.getRate({
      amount: 1,
      currency_pair: params.pair,
      type: 'buy'
    });
    return Response.json(rate);
  } catch (error) {
    console.error('Rate fetch error:', error);
    return Response.json({ error: 'Failed to fetch rate' }, { status: 500 });
  }
} 