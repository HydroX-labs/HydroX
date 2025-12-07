"use client";

import React, { useState } from "react";

const TradePanel = () => {
  const [activeTab, setActiveTab] = useState("buy"); // 'buy' or 'sell'
  const [marginType, setMarginType] = useState("Cross"); // 'Cross' or 'Isolated'
  const [leverage, setLeverage] = useState("1x"); // State for leverage
  const [reduceOnly, setReduceOnly] = useState(false); // State for Reduce Only checkbox
  const [timeInForce, setTimeInForce] = useState("GTC"); // GTC, IOC, FOK
  const leverageOptions = ["1x", "5x", "10x", "20x", "50x", "100x"];

  return (
    <div className="w-full rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] p-4 text-white h-full">
      <div className="flex border-b border-[#1f1f1f]">
        <button
          onClick={() => setActiveTab("buy")}
          className={`py-2 px-4 text-sm font-medium transition-all ${
            activeTab === "buy"
              ? "border-b-2 border-[#00FFE0] text-[#00FFE0]"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setActiveTab("sell")}
          className={`py-2 px-4 text-sm font-medium transition-all ${
            activeTab === "sell"
              ? "border-b-2 border-red-500 text-red-500"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Sell
        </button>
      </div>
      <div className="mt-4 space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <div className="flex justify-between bg-[#141414] border border-[#1f1f1f] rounded p-1">
              <button
                onClick={() => setMarginType("Cross")}
                className={`flex-1 py-1 text-sm rounded transition-all ${
                  marginType === "Cross"
                    ? "bg-[#00FFE0]/10 text-[#00FFE0] border border-[#00FFE0]/30"
                    : "text-zinc-400 hover:bg-[#1a1a1a] hover:text-zinc-200"
                }`}
              >
                Cross
              </button>
              <button
                onClick={() => setMarginType("Isolated")}
                className={`flex-1 py-1 text-sm rounded transition-all ${
                  marginType === "Isolated"
                    ? "bg-[#00FFE0]/10 text-[#00FFE0] border border-[#00FFE0]/30"
                    : "text-zinc-400 hover:bg-[#1a1a1a] hover:text-zinc-200"
                }`}
              >
                Isolated
              </button>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Leverage</label>
          <div className="flex justify-between bg-[#141414] border border-[#1f1f1f] rounded p-1">
            {leverageOptions.map((option) => (
              <button
                key={option}
                onClick={() => setLeverage(option)}
                className={`flex-1 py-1 text-sm rounded transition-all ${
                  leverage === option
                    ? "bg-[#00FFE0]/10 text-[#00FFE0] border border-[#00FFE0]/30"
                    : "text-zinc-400 hover:bg-[#1a1a1a] hover:text-zinc-200"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="price" className="block text-xs text-zinc-400 mb-1">
            Price (USD)
          </label>
          <input
            type="text"
            id="price"
            defaultValue="Market"
            className="w-full bg-[#141414] border border-[#1f1f1f] rounded p-2 text-sm focus:border-[#00FFE0]/50 focus:outline-none focus:ring-1 focus:ring-[#00FFE0]/20 transition-all"
          />
        </div>
        <div>
          <label htmlFor="amount" className="block text-xs text-zinc-400 mb-1">
            Amount (BTC)
          </label>
          <input
            type="text"
            id="amount"
            placeholder="0.00"
            className="w-full bg-[#141414] border border-[#1f1f1f] rounded p-2 text-sm focus:border-[#00FFE0]/50 focus:outline-none focus:ring-1 focus:ring-[#00FFE0]/20 transition-all"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="reduceOnly"
              checked={reduceOnly}
              onChange={(e) => setReduceOnly(e.target.checked)}
              className="h-4 w-4 rounded border-[#1f1f1f] bg-[#141414] text-[#00FFE0] focus:ring-[#00FFE0]/50 accent-[#00FFE0]"
            />
            <label htmlFor="reduceOnly" className="ml-2 text-sm text-zinc-400">
              Reduce Only
            </label>
          </div>
          <select
            id="timeInForce"
            value={timeInForce}
            onChange={(e) => setTimeInForce(e.target.value)}
            className="bg-[#141414] border border-[#1f1f1f] rounded p-1 text-sm text-zinc-300 focus:border-[#00FFE0]/50 focus:outline-none"
          >
            <option>GTC</option>
            <option>IOC</option>
            <option>FOK</option>
          </select>
        </div>
        <div className="flex justify-between text-xs text-zinc-400">
          <span>Total</span>
          <span>0.00 USD</span>
        </div>
        {activeTab === "buy" ? (
          <button className="w-full bg-[#00FFE0] hover:bg-[#00FFE0]/90 text-black font-bold py-2 px-4 rounded transition-all hover:shadow-[0_0_20px_rgba(0,255,224,0.4)]">
            Buy BTC
          </button>
        ) : (
          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]">
            Sell BTC
          </button>
        )}
      </div>
    </div>
  );
};

export default TradePanel;

