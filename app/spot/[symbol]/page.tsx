"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Chart from "@/components/Chart";
import TradeHistory from "@/components/TradeHistory";
import TradePanel from "@/components/TradePanel";
import SymbolSelector from "@/components/SymbolSelector";
import MarketInfo from "@/components/MarketInfo";
import BottomPanel from "@/components/BottomPanel";

export default function SpotPage() {
  const params = useParams();
  const symbolParam = params.symbol as string;

  // Spot은 _PERP 없이 그대로 사용 (BTC_USDM -> BTC_USDM)
  const initialSymbol = symbolParam.replace(/_PERP$/, "");

  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);

  return (
    <div
      className="bg-[#0a0a0a] font-sans h-full flex flex-col"
      style={{ overflowY: "overlay" }}
    >
      <div id="exchange" className="p-4 flex flex-col gap-3">
        {/* 거래쌍 선택 + 시장 정보 */}
        <div className="flex items-stretch bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg shrink-0">
          <SymbolSelector
            selectedSymbol={selectedSymbol}
            onSymbolChange={setSelectedSymbol}
          />
          <MarketInfo symbol={selectedSymbol} />
        </div>

        <main className="w-full flex h-[600px] gap-3">
          <div className="w-1/2 h-full">
            <Chart />
          </div>
          <div className="w-1/4 h-full rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] overflow-hidden">
            <div className="p-3 border-b border-[#1f1f1f]">
              <span className="text-sm font-medium text-white">Trade History</span>
            </div>
            <div className="p-3 h-[calc(100%-44px)] overflow-auto">
              <TradeHistory />
            </div>
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
