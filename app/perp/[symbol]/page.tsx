"use client";

import Chart from "@/components/Chart";
import BottomPanel from "@/components/BottomPanel";

export default function PerpPage() {
  return (
    <div
      className="bg-[#0a0a0a] font-sans h-full flex flex-col"
      style={{ overflowY: "overlay" }}
    >
      <div id="exchange" className="p-4 flex flex-col gap-3 h-full">
        {/* 차트 */}
        <main className="w-full flex-1 min-h-0">
          <Chart />
        </main>

        {/* 하단 패널: 포지션, 주문, 잔고 */}
        <div className="shrink-0">
          <BottomPanel />
        </div>
      </div>
    </div>
  );
}
