import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "BTC_USDC_PERP";

  try {
    const response = await fetch(
      `https://api.backpack.exchange/api/v1/ticker?symbol=${symbol}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ticker: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[TICKER API ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch ticker" },
      { status: 500 }
    );
  }
}
