"use client";

import { useEffect, useState, useRef } from "react";

interface MarketInfoProps {
  symbol: string;
}

interface TickerData {
  symbol: string;
  lastPrice: string;
  priceChange: string;
  priceChangePercent: string;
  high: string;
  low: string;
  volume: string;
  quoteVolume: string;
  trades: string;
}

export default function MarketInfo({ symbol }: MarketInfoProps) {
  const [ticker, setTicker] = useState<TickerData | null>(null);
  const [markPrice, setMarkPrice] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // REST API로 초기 ticker 데이터 로드
  useEffect(() => {
    const fetchTicker = async () => {
      try {
        const response = await fetch(`/api/backpack/ticker?symbol=${symbol}`);
        if (response.ok) {
          const data = await response.json();
          setTicker(data);
        }
      } catch (error) {
        console.error("Failed to fetch ticker:", error);
      }
    };

    fetchTicker();
    // 30초마다 갱신
    const interval = setInterval(fetchTicker, 30000);
    return () => clearInterval(interval);
  }, [symbol]);

  // WebSocket으로 실시간 가격 업데이트
  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Backpack WebSocket은 USDC 심볼을 사용하므로 USDM -> USDC 변환
    const apiSymbol = symbol.replace(/USDM/g, "USDC");

    const ws = new WebSocket("wss://ws.backpack.exchange/");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          method: "SUBSCRIBE",
          params: [`trade.${apiSymbol}`, `markPrice.${apiSymbol}`],
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.data?.e === "trade") {
          setTicker((prev) =>
            prev ? { ...prev, lastPrice: message.data.p } : null
          );
        } else if (message.data?.e === "markPrice") {
          setMarkPrice(message.data.p);
        }
      } catch {
        // ignore
      }
    };

    return () => {
      ws.close();
    };
  }, [symbol]);

  if (!ticker) {
    return (
      <div className="px-6 py-3 flex-1 flex items-center">
        <div className="text-zinc-500 text-sm">Loading...</div>
      </div>
    );
  }

  const priceChangePercent = parseFloat(ticker.priceChangePercent);
  const isPositive = priceChangePercent >= 0;
  const displaySymbol = symbol.replace(/_/g, "/").replace("/PERP", " PERP");

  const formatNumber = (value: string, decimals = 2) => {
    const num = parseFloat(value);
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + "K";
    }
    return num.toFixed(decimals);
  };

  const formatPrice = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1000) {
      return num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return num.toFixed(4);
  };

  return (
    <div className="px-6 py-2 flex-1 flex items-center">
      <div className="flex items-center gap-8">
        {/* 현재 가격 */}
        <div className="flex flex-col">
          <span
            className={`text-xl font-bold ${
              isPositive ? "text-[#00FFE0] drop-shadow-[0_0_8px_rgba(0,255,224,0.4)]" : "text-red-500"
            }`}
          >
            ${formatPrice(ticker.lastPrice)}
          </span>
          <span className="text-xs text-zinc-500">
            Mark {markPrice ? `$${formatPrice(markPrice)}` : "-"}
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
            {priceChangePercent.toFixed(2)}%
          </span>
        </div>

        {/* 24h 고가 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase">24h High</span>
          <span className="text-sm text-zinc-200">${formatPrice(ticker.high)}</span>
        </div>

        {/* 24h 저가 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase">24h Low</span>
          <span className="text-sm text-zinc-200">${formatPrice(ticker.low)}</span>
        </div>

        {/* 24h 거래량 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase">24h Volume</span>
          <span className="text-sm text-zinc-200">
            {formatNumber(ticker.volume, 2)} {symbol.split("_")[0]}
          </span>
        </div>

        {/* 24h 거래대금 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase">24h Turnover</span>
          <span className="text-sm text-zinc-200">
            ${formatNumber(ticker.quoteVolume)}
          </span>
        </div>
      </div>
    </div>
  );
}
