import { NextResponse } from "next/server";

// Instead of exporting dynamic directly, we'll make it a config object
export const config = {
  runtime: 'edge',
  regions: ['iad1'],
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const market = url.searchParams.get('market');
    const period = url.searchParams.get('period') || '24h';

    if (!market) {
      return NextResponse.json(
        { success: false, message: 'Market parameter is required' },
        { status: 400 }
      );
    }

    // Mock data generation based on period
    const now = Date.now();
    const dataPoints = period === '24h' ? 24 : period === '7d' ? 168 : period === '30d' ? 720 : 8760;
    const interval = period === '24h' ? 3600000 : period === '7d' ? 14400000 : period === '30d' ? 43200000 : 86400000;
    
    const mockData = Array.from({ length: dataPoints }, (_, i) => {
      const timestamp = now - (dataPoints - i) * interval;
      const basePrice = 100 + Math.random() * 50;
      return {
        time: timestamp / 1000,
        value: basePrice + Math.sin(i / 10) * 20 + Math.random() * 10
      };
    });

    return NextResponse.json({
      success: true,
      data: mockData
    });
  } catch (error) {
    console.error('Failed to fetch market history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch market history' },
      { status: 500 }
    );
  }
} 