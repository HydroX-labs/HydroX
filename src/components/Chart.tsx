"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  CandlestickSeries,
  ISeriesApi,
  CandlestickData,
  Time,
} from "lightweight-charts";

// Mock 데이터 - 정적 차트용
const generateMockData = (): CandlestickData<Time>[] => {
  const data: CandlestickData<Time>[] = [];
  let basePrice = 97000;
  const now = Math.floor(Date.now() / 1000);
  const hourInSeconds = 3600;

  for (let i = 100; i >= 0; i--) {
    const time = (now - i * hourInSeconds) as Time;
    const open = basePrice + (Math.random() - 0.5) * 500;
    const close = open + (Math.random() - 0.5) * 800;
    const high = Math.max(open, close) + Math.random() * 300;
    const low = Math.min(open, close) - Math.random() * 300;

    data.push({ time, open, high, low, close });
    basePrice = close;
  }

  return data;
};

export default function Chart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

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

    // Mock 데이터 로드
    const mockData = generateMockData();
    candlestickSeries.setData(mockData);
    chart.timeScale().fitContent();

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

  return (
    <div className="relative w-full h-full rounded-lg border border-[#1a1a1a] bg-[#0f0f0f]">
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
