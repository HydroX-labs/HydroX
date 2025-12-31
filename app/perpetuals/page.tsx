"use client";

import Chart from "@/components/Chart";
import TradePanel from "@/components/TradePanel";
import MarketInfo from "@/components/MarketInfo";
import BottomPanel from "@/components/BottomPanel";
import { useWallet } from "@/contexts/WalletContext";

export default function PerpetualsPage() {
  const symbol = "BTC_USDM";
  const { walletAddress } = useWallet();

  return (
    <div
      className="bg-[#0a0a0a] font-sans h-full flex flex-col"
      style={{ overflowY: "overlay" }}
    >
      <div id="exchange" className="p-4 flex flex-col gap-3">
        {/* 시장 정보 - BTC 고정 */}
        <div className="flex items-stretch bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg shrink-0">
          <div className="px-4 py-3 flex items-center border-r border-[#1f1f1f]">
            <span className="text-white font-bold text-lg">BTC/USDM</span>
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-[#00FFE0]/10 text-[#00FFE0] border border-[#00FFE0]/30">
              PERP
            </span>
          </div>
          <MarketInfo symbol={symbol} />
        </div>

        <main className="w-full flex h-[600px] gap-3">
          {/* 차트 - Trade History 제거로 인해 더 넓게 */}
          <div className="w-3/4 h-full">
            <Chart symbol={symbol} />
          </div>
          {/* 거래 패널 */}
          <div className="w-1/4 h-full">
            <TradePanel walletAddress={walletAddress} />
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
