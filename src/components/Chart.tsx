"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  CandlestickSeries,
  ISeriesApi,
  CandlestickData,
  Time,
} from "lightweight-charts";

interface ChartProps {
  symbol: string;
}

interface KlineData {
  start: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export default function Chart({ symbol }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const interval = "1h";

  // 차트 초기화
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#6b7280",
      },
      grid: {
        vertLines: { color: "#1a1a1a" },
        horzLines: { color: "#1a1a1a" },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 400,
      crosshair: {
        vertLine: {
          color: "#00FFE0",
          labelBackgroundColor: "#0f0f0f",
        },
        horzLine: {
          color: "#00FFE0",
          labelBackgroundColor: "#0f0f0f",
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#1a1a1a",
      },
      rightPriceScale: {
        borderColor: "#1a1a1a",
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#00FFE0",
      downColor: "#ef4444",
      borderDownColor: "#ef4444",
      borderUpColor: "#00FFE0",
      wickDownColor: "#ef4444",
      wickUpColor: "#00FFE0",
    });

    seriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // 심볼 변경 시 데이터 fetch 및 WebSocket 연결
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) return;

    // 기존 WebSocket 연결 종료
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const fetchKlinesAndSubscribe = async () => {
      setIsLoading(true);

      try {
        // 1. REST API로 초기 데이터 로드
        const response = await fetch(
          `/api/backpack/klines?symbol=${symbol}&interval=${interval}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch klines");
        }

        const data: KlineData[] = await response.json();

        // Backpack API 응답을 lightweight-charts 형식으로 변환
        const chartData: CandlestickData<Time>[] = data.map((item) => ({
          time: Math.floor(new Date(item.start).getTime() / 1000) as Time,
          open: parseFloat(item.open),
          high: parseFloat(item.high),
          low: parseFloat(item.low),
          close: parseFloat(item.close),
        }));

        // 시간순 정렬
        chartData.sort((a, b) => (a.time as number) - (b.time as number));

        seriesRef.current?.setData(chartData);
        chartRef.current?.timeScale().fitContent();

        setIsLoading(false);

        // 2. WebSocket 연결하여 실시간 업데이트 구독
        // Backpack WebSocket은 USDC 심볼을 사용하므로 USDM -> USDC 변환
        const apiSymbol = symbol.replace(/USDM/g, "USDC");
        const ws = new WebSocket("wss://ws.backpack.exchange/");
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("[Chart] WebSocket connected");
          ws.send(
            JSON.stringify({
              method: "SUBSCRIBE",
              params: [`kline.${interval}.${apiSymbol}`],
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);

            // kline 이벤트 처리
            if (message.data?.e === "kline") {
              const d = message.data;

              // 즉시 업데이트 - Date.parse가 new Date보다 빠름
              seriesRef.current?.update({
                time: (Date.parse(d.t + "Z") / 1000) as Time,
                open: +d.o,
                high: +d.h,
                low: +d.l,
                close: +d.c,
              });
            }
          } catch {
            // 파싱 에러 무시
          }
        };

        ws.onerror = (error) => {
          console.error("[Chart] WebSocket error:", error);
        };

        ws.onclose = () => {
          console.log("[Chart] WebSocket closed");
        };
      } catch (error) {
        console.error("Failed to fetch klines:", error);
        setIsLoading(false);
      }
    };

    fetchKlinesAndSubscribe();

    // cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [symbol, interval]);

  return (
    <div className="relative w-full h-full rounded-lg border border-[#1a1a1a] bg-[#0f0f0f]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f0f]/80 z-10">
          <div className="flex items-center gap-2 text-[#00FFE0]">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading chart...</span>
          </div>
        </div>
      )}
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
