import { NextRequest, NextResponse } from 'next/server';
import { QuidaxClient } from '@/app/lib/services/quidax-client';
import { QUIDAX_CONFIG } from '@/app/lib/config/quidax';

type OrderBookEntry = [string, string]; // [price, amount]
interface OrderBookResponse {
  data: {
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const market = url.pathname.split('/').pop() || '';
    const quidaxClient = new QuidaxClient(QUIDAX_CONFIG.apiKey);
    const orderBook = await quidaxClient.fetchOrderBook(market);

    if (!orderBook || !orderBook.bids || !orderBook.asks) {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Invalid order book data received'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return new Response(JSON.stringify({
      status: 'success',
      data: {
        bids: orderBook.bids.map(([price, amount]: OrderBookEntry) => ({
          price,
          amount,
          total: (parseFloat(price) * parseFloat(amount)).toString()
        })),
        asks: orderBook.asks.map(([price, amount]: OrderBookEntry) => ({
          price,
          amount,
          total: (parseFloat(price) * parseFloat(amount)).toString()
        }))
      }
    }), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error('[OrderBook API] Error:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: error.message || 'Failed to fetch order book'
    }), {
      status: error.status || 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 