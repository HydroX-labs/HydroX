import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "BTC_USDM_PERP";
  const interval = searchParams.get("interval") || "1h";

  // 기본적으로 최근 200개 캔들 조회 (약 8일치 1시간봉)
  const endTime = Math.floor(Date.now() / 1000);
  const startTime = searchParams.get("startTime")
    ? parseInt(searchParams.get("startTime")!)
    : endTime - (200 * 60 * 60); // 200시간 전

  try {
    const url = `https://api.backpack.exchange/api/v1/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from Backpack API: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("[KLINES API ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch klines data" },
      { status: 500 }
    );
  }
}
