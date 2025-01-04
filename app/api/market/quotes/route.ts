import { NextResponse } from 'next/server';

const QUIDAX_API_URL = process.env.NEXT_PUBLIC_QUIDAX_API_URL || 'https://www.quidax.com/api/v1';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromCurrency = searchParams.get('from_currency')?.toUpperCase() || 'BTC';
    const toCurrency = searchParams.get('to_currency')?.toUpperCase() || 'USDT';
    const volume = searchParams.get('volume') || '1';

    console.log('Fetching quote for:', { fromCurrency, toCurrency, volume });

    const response = await fetch(
      `${QUIDAX_API_URL}/markets/tickers`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch market data:', await response.text());
      throw new Error('Failed to fetch market data');
    }

    const data = await response.json();
    console.log('Market data received:', data);

    if (data.status !== 'success' || !data.data) {
      throw new Error('Invalid market data received');
    }

    // Handle NGN/USDT pair
    if ((fromCurrency === 'NGN' && toCurrency === 'USDT') || (fromCurrency === 'USDT' && toCurrency === 'NGN')) {
      const usdtngn = data.data.usdtngn;
      if (!usdtngn || !usdtngn.ticker || !usdtngn.ticker.last) {
        throw new Error('USDT/NGN market data not available');
      }

      const baseRate = parseFloat(usdtngn.ticker.last);
      if (isNaN(baseRate) || baseRate <= 0) {
        throw new Error('Invalid USDT/NGN rate');
      }

      const rate = fromCurrency === 'NGN' ? 1 / baseRate : baseRate;
      
      return NextResponse.json({
        status: 'success',
        data: {
          price: {
            amount: rate.toString(),
            unit: toCurrency
          },
          market: 'usdtngn',
          reversed: fromCurrency === 'NGN'
        }
      });
    }

    // For other pairs
    const market = `${fromCurrency.toLowerCase()}${toCurrency.toLowerCase()}`;
    const reverseMarket = `${toCurrency.toLowerCase()}${fromCurrency.toLowerCase()}`;

    console.log('Checking market pairs:', { market, reverseMarket });

    // Try direct market pair
    if (data.data[market] && data.data[market].ticker && data.data[market].ticker.last) {
      const rate = parseFloat(data.data[market].ticker.last);
      if (!isNaN(rate) && rate > 0) {
        return NextResponse.json({
          status: 'success',
          data: {
            price: {
              amount: rate.toString(),
              unit: toCurrency
            },
            market: market,
            reversed: false
          }
        });
      }
    }

    // Try reverse market pair
    if (data.data[reverseMarket] && data.data[reverseMarket].ticker && data.data[reverseMarket].ticker.last) {
      const rate = 1 / parseFloat(data.data[reverseMarket].ticker.last);
      if (!isNaN(rate) && rate > 0) {
        return NextResponse.json({
          status: 'success',
          data: {
            price: {
              amount: rate.toString(),
              unit: toCurrency
            },
            market: reverseMarket,
            reversed: true
          }
        });
      }
    }

    console.error('No valid market pair found:', { market, reverseMarket });
    throw new Error(`Market pair not available for ${fromCurrency}/${toCurrency}`);
  } catch (error) {
    console.error('Error in quotes API:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to fetch quote'
      },
      { status: 500 }
    );
  }
} 