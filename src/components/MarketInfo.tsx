"use client";

import { useEffect, useState } from "react";
import { marketApi, getWSClient, Ticker } from "@/lib/api";

interface MarketInfoProps {
  symbol: string;
}

export default function MarketInfo({ symbol }: MarketInfoProps) {
  const [ticker, setTicker] = useState<Ticker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTicker = async () => {
      try {
        const data = await marketApi.getTicker(symbol);
        setTicker(data);
      } catch (err) {
        console.error("Failed to load ticker:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTicker();

    // Subscribe to real-time updates
    const ws = getWSClient();
    ws.connect();

    const unsubscribe = ws.subscribe("ticker", (data: unknown) => {
      const tickerData = data as Ticker;
      if (tickerData.symbol === symbol) {
        setTicker((prev: Ticker | null) => prev ? { ...prev, ...tickerData } : tickerData);
      }
    });

    // Refresh every 30 seconds as backup
    const interval = setInterval(loadTicker, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [symbol]);

  const formatPrice = (value: number | undefined) => {
    if (value === undefined) return "--";
    if (value >= 1000) {
      return value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return value.toFixed(4);
  };

  const formatNumber = (value: number | undefined) => {
    if (value === undefined) return "--";
    if (value >= 1000000) {
      return (value / 1000000).toFixed(2) + "M";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(2) + "K";
    }
    return value.toFixed(2);
  };

  const isPositive = (ticker?.price_change_percent ?? 0) >= 0;

  if (loading) {
    return (
      <div className="px-6 py-2 flex-1 flex items-center">
        <div className="text-zinc-500 text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-6 py-2 flex-1 flex items-center">
      <div className="flex items-center gap-8">
        {/* 현재 가격 */}
        <div className="flex flex-col">
          <span
            className={`text-xl font-bold ${
              isPositive 
                ? "text-[#00FFE0] drop-shadow-[0_0_8px_rgba(0,255,224,0.4)]" 
                : "text-red-500"
            }`}
          >
            ${formatPrice(ticker?.last_price)}
          </span>
          <span className="text-xs text-zinc-500">
            Mark ${formatPrice(ticker?.mark_price)}
          </span>
        </div>

        {/* 구분선 */}
        <div className="h-8 w-px bg-[#1f1f1f]" />

        {/* 24h 변동률 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase">24h Change</span>
          <span
            className={`text-sm font-medium ${
              isPositive ? "text-[#00FFE0]" : "text-red-500"
            }`}
          >
            {isPositive ? "+" : ""}
            {ticker?.price_change_percent?.toFixed(2) ?? "--"}%
          </span>
        </div>

        {/* 24h 고가 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase">24h High</span>
          <span className="text-sm text-zinc-200">${formatPrice(ticker?.high_24h)}</span>
        </div>

        {/* 24h 저가 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase">24h Low</span>
          <span className="text-sm text-zinc-200">${formatPrice(ticker?.low_24h)}</span>
        </div>

        {/* 24h 거래량 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase">24h Volume</span>
          <span className="text-sm text-zinc-200">
            {formatNumber(ticker?.volume_24h)} {symbol.split("_")[0]}
          </span>
        </div>

        {/* 24h 거래대금 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase">24h Turnover</span>
          <span className="text-sm text-zinc-200">
            ${formatNumber(ticker?.quote_volume_24h)}
          </span>
        </div>
      </div>
    </div>
  );
}
