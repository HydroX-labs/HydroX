"use client";

import { useState } from "react";
import Chart from "@/components/Chart";
import MiddlePanel from "@/components/MiddlePanel";
import TradePanel from "@/components/TradePanel";
import SymbolSelector from "@/components/SymbolSelector";
import MarketInfo from "@/components/MarketInfo";
import BottomPanel from "@/components/BottomPanel";

export default function Home() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC_USDC_PERP");

  return (
    <div
      className="bg-zinc-950 font-sans h-full flex flex-col"
      style={{ overflowY: "overlay" }}
    >
      <div id="exchange" className="p-4 flex flex-col gap-3">
        {/* 거래쌍 선택 + 시장 정보 */}
        <div className="flex items-stretch bg-zinc-900 border border-zinc-800 rounded-lg shrink-0">
          <SymbolSelector
            selectedSymbol={selectedSymbol}
            onSymbolChange={setSelectedSymbol}
          />
          <MarketInfo symbol={selectedSymbol} />
        </div>

        <main className="w-full flex h-[600px] gap-3">
          <div className="w-1/2 h-full">
            <Chart symbol={selectedSymbol} />
          </div>
          <div className="w-1/4 h-full">
            <MiddlePanel symbol={selectedSymbol} />
          </div>
          <div className="w-1/4 h-full">
            <TradePanel />
          </div>
        </main>

        {/* 하단 패널: 포지션, 주문, 잔고 */}
        <div className="shrink-0">
          <BottomPanel />
        </div>
      </div>
    </div>
  );
}
