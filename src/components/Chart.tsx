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
import { marketApi, getWSClient, Kline } from "@/lib/api";

interface ChartProps {
  symbol?: string;
}

export default function Chart({ symbol = "BTC_USDM_PERP" }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // 데이터 로드
  useEffect(() => {
    if (!seriesRef.current || !chartRef.current) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const klines = await marketApi.getKlines(symbol, "1h");
        
        const chartData: CandlestickData<Time>[] = klines.map((k: Kline) => ({
          time: k.time as Time,
          open: k.open,
          high: k.high,
          low: k.low,
          close: k.close,
        }));

        // Sort by time
        chartData.sort((a, b) => (a.time as number) - (b.time as number));

        seriesRef.current?.setData(chartData);
        chartRef.current?.timeScale().fitContent();
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load chart data:", err);
        setError("Failed to load chart data");
        setIsLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time updates
    const ws = getWSClient();
    ws.connect();

    const unsubscribe = ws.subscribe(`kline.1h.${symbol}`, (data: unknown) => {
      const kline = data as { t: number; o: number; h: number; l: number; c: number };
      seriesRef.current?.update({
        time: kline.t as Time,
        open: kline.o,
        high: kline.h,
        low: kline.l,
        close: kline.c,
      });
    });

    return () => {
      unsubscribe();
    };
  }, [symbol]);

  return (
    <div className="relative w-full h-full rounded-lg border border-[#1a1a1a] bg-[#0f0f0f]">
      <div ref={chartContainerRef} className="w-full h-full" />
      
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

      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-zinc-500">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
