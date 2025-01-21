import { NextResponse } from "next/server";

export const runtime = "edge";
export const preferredRegion = ["iad1"];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const market = url.searchParams.get('market')?.toLowerCase();
    const period = url.searchParams.get('period') || '24h';

    if (!market) {
      return NextResponse.json(
        { success: false, message: 'Market parameter is required' },
        { status: 400 }
      );
    }

    // Fetch k-line data from Quidax
    const response = await fetch(
      `https://www.quidax.com/api/v1/markets/${market}/k?period=${period}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch market history');
    }

    const data = await response.json();
    
    if (data.status !== 'success' || !data.data) {
      throw new Error('Invalid response from Quidax API');
    }

    // Transform the data to match our expected format
    const transformedData = data.data.map((item: any) => ({
      time: item[0] / 1000, // Convert timestamp to seconds
      value: parseFloat(item[4]) // Use closing price
    }));

    return NextResponse.json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Failed to fetch market history:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch market history' },
      { status: 500 }
    );
  }
} 