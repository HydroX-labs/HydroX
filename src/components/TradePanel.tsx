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
    <div className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-white h-full">
      <div className="flex border-b border-zinc-700">
        <button
          onClick={() => setActiveTab("buy")}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === "buy"
              ? "border-b-2 border-green-500 text-white"
              : "text-zinc-400"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setActiveTab("sell")}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === "sell"
              ? "border-b-2 border-red-500 text-white"
              : "text-zinc-400"
          }`}
        >
          Sell
        </button>
      </div>
      <div className="mt-4 space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <div className="flex justify-between bg-zinc-800 rounded p-1">
              <button
                onClick={() => setMarginType("Cross")}
                className={`flex-1 py-1 text-sm rounded ${
                  marginType === "Cross"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:bg-zinc-700/50"
                }`}
              >
                Cross
              </button>
              <button
                onClick={() => setMarginType("Isolated")}
                className={`flex-1 py-1 text-sm rounded ${
                  marginType === "Isolated"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:bg-zinc-700/50"
                }`}
              >
                Isolated
              </button>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Leverage</label>
          <div className="flex justify-between bg-zinc-800 rounded p-1">
            {leverageOptions.map((option) => (
              <button
                key={option}
                onClick={() => setLeverage(option)}
                className={`flex-1 py-1 text-sm rounded ${
                  leverage === option
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:bg-zinc-700/50"
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
            className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm"
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
            className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="reduceOnly"
              checked={reduceOnly}
              onChange={(e) => setReduceOnly(e.target.checked)}
              className="h-4 w-4 text-green-500 rounded border-gray-600 focus:ring-green-500"
            />
            <label htmlFor="reduceOnly" className="ml-2 text-sm text-zinc-400">
              Reduce Only
            </label>
          </div>
          <select
            id="timeInForce"
            value={timeInForce}
            onChange={(e) => setTimeInForce(e.target.value)}
            className="bg-zinc-800 border-none rounded p-1 text-sm text-zinc-300"
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
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Buy BTC
          </button>
        ) : (
          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Sell BTC
          </button>
        )}
      </div>
    </div>
  );
};

export default TradePanel;
