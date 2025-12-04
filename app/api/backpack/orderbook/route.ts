import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "BTC_USDM_PERP";
  // Backpack API는 USDC 심볼을 사용하므로 USDM -> USDC 변환
  const apiSymbol = symbol.replace(/USDM/g, "USDC");

  try {
    const response = await fetch(
      `https://api.backpack.exchange/api/v1/depth?symbol=${apiSymbol}`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch from Backpack API: ${response.statusText}`
      );
    }
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("[ORDERBOOK API ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch order book" },
      { status: 500 }
    );
  }
}
