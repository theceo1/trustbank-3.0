import { NextResponse } from "next/server";
import { rateLimiter } from "@/app/lib/middleware/rateLimiter";
import { QuidaxService } from "@/app/lib/services/quidax";

export async function GET(request: Request) {
  const rateLimitResult = await rateLimiter(request);
  if (rateLimitResult) return rateLimitResult;

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

  try {
    const rate = await QuidaxService.getRate({
      amount,
      currency_pair: `${currency.toLowerCase()}_ngn`,
      type
    });
    return NextResponse.json(rate);
  } catch (error) {
    console.error("Rate fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rate" },
      { status: 500 }
    );
  }
}