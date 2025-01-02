import { NextResponse } from "next/server";
import { rateLimiter } from "@/app/lib/middleware/rateLimiter";
import { MarketRateService } from "@/app/lib/services/market-rate";

export async function GET(request: Request) {
  const rateLimitResult = await rateLimiter(request);
  if (rateLimitResult) return rateLimitResult;

  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get("currency");
    const amount = Number(searchParams.get("amount"));
    const type = searchParams.get("type") as 'buy' | 'sell';
    
    if (!currency || !amount || !type) {
      return NextResponse.json(
        { error: "Currency, amount and type are required" },
        { status: 400 }
      );
    }

    // Use crypto/rate endpoint instead of direct market rate service
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/crypto/rate/${currency}`,
      { next: { revalidate: 30 } }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch rate');
    }

    const { rate } = await response.json();
    
    return NextResponse.json({
      rate,
      amount,
      total: amount * rate,
      type
    });
  } catch (error) {
    console.error("Rate fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rate" },
      { status: 500 }
    );
  }
}