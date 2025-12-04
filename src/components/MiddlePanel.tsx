"use client";

import React from "react";
import TradeHistory from "./TradeHistory";

const MiddlePanel = () => {
  return (
    <div className="w-full h-full flex flex-col relative rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <div className="p-3 border-b border-zinc-700 shrink-0">
        <span className="text-sm font-medium text-white">Trade History</span>
      </div>
      <div className="p-3 flex-grow overflow-auto">
        <TradeHistory />
      </div>
    </div>
  );
};

export default MiddlePanel;
