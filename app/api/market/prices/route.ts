import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const market = searchParams.get("market");

    if (!market) {
      return NextResponse.json(
        { error: "Market parameter is required" },
        { status: 400 }
      );
    }

    // In development, return mock data
    const mockRates: Record<string, any> = {
      ngn: { last: "750.00" },
      usdt: { last: "1.00" },
      btc: { last: "45000.00" },
      eth: { last: "2500.00" }
    };

    return NextResponse.json({
      status: "success",
      data: mockRates
    });
  } catch (error) {
    console.error("[API] Error fetching market rates:", error);
    return NextResponse.json(
      { error: "Unable to fetch market rates. Please try again later." },
      { status: 500 }
    );
  }
}
