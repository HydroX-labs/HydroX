"use client";

import React, { useState } from "react";
import { tradingApi, marketApi, Ticker } from "@/lib/api";
import { useEffect } from "react";

interface TradePanelProps {
  symbol?: string;
}

const TradePanel = ({ symbol = "BTC_USDM_PERP" }: TradePanelProps) => {
  const [activeTab, setActiveTab] = useState("buy"); // 'buy' or 'sell'
  const [marginType, setMarginType] = useState("Cross"); // 'Cross' or 'Isolated'
  const [leverage, setLeverage] = useState("10"); // Numeric leverage
  const [reduceOnly, setReduceOnly] = useState(false);
  const [timeInForce, setTimeInForce] = useState("GTC"); // GTC, IOC, FOK
  const [orderType, setOrderType] = useState("market"); // market, limit
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticker, setTicker] = useState<Ticker | null>(null);

  const leverageOptions = ["1", "5", "10", "20", "50", "100"];

  // Load current price for reference
  useEffect(() => {
    const loadTicker = async () => {
      try {
        const data = await marketApi.getTicker(symbol);
        setTicker(data);
      } catch (err) {
        console.error("Failed to load ticker:", err);
      }
    };
    loadTicker();
  }, [symbol]);

  const handleSubmit = async () => {
    if (!amount || (orderType === "limit" && !price)) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const order = {
        symbol,
        side: activeTab === "buy" ? "Buy" : "Sell",
        type: orderType === "market" ? "Market" : "Limit",
        price: orderType === "limit" ? parseFloat(price) : undefined,
        amount: parseFloat(amount),
        leverage: parseInt(leverage),
        time_in_force: timeInForce,
        reduce_only: reduceOnly,
      };

      await tradingApi.createOrder(order);

      // Clear form
      setAmount("");
      if (orderType === "limit") setPrice("");
    } catch (err) {
      console.error("Failed to place order:", err);
      setError("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const baseAsset = symbol.split("_")[0];

  // Calculate estimated total
  const estimatedTotal = (() => {
    if (!amount) return 0;
    const qty = parseFloat(amount);
    const p =
      orderType === "limit" && price
        ? parseFloat(price)
        : ticker?.last_price || 0;
    return qty * p;
  })();

  return (
    <div className="w-full rounded-lg border border-[#1a1a1a] bg-[#0f0f0f] p-4 text-white h-full">
      {/* Buy/Sell Tabs */}
      <div className="flex border-b border-[#1f1f1f]">
        <button
          onClick={() => setActiveTab("buy")}
          className={`py-2 px-4 text-sm font-medium transition-all ${
            activeTab === "buy"
              ? "border-b-2 border-[#00FFE0] text-[#00FFE0]"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Buy / Long
        </button>
        <button
          onClick={() => setActiveTab("sell")}
          className={`py-2 px-4 text-sm font-medium transition-all ${
            activeTab === "sell"
              ? "border-b-2 border-red-500 text-red-500"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Sell / Short
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {/* Order Type */}
        <div className="flex gap-2">
          <button
            onClick={() => setOrderType("market")}
            className={`flex-1 py-1.5 text-sm rounded transition-all ${
              orderType === "market"
                ? "bg-[#00FFE0]/10 text-[#00FFE0] border border-[#00FFE0]/30"
                : "bg-[#141414] border border-[#1f1f1f] text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Market
          </button>
          <button
            onClick={() => setOrderType("limit")}
            className={`flex-1 py-1.5 text-sm rounded transition-all ${
              orderType === "limit"
                ? "bg-[#00FFE0]/10 text-[#00FFE0] border border-[#00FFE0]/30"
                : "bg-[#141414] border border-[#1f1f1f] text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Limit
          </button>
        </div>

        {/* Margin Type */}
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

        {/* Leverage */}
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
                {option}x
              </button>
            ))}
          </div>
        </div>

        {/* Price (for Limit orders) */}
        {orderType === "limit" && (
          <div>
            <label htmlFor="price" className="block text-xs text-zinc-400 mb-1">
              Price (USD)
            </label>
            <input
              type="text"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={ticker?.last_price?.toFixed(2) || "0.00"}
              className="w-full bg-[#141414] border border-[#1f1f1f] rounded p-2 text-sm focus:border-[#00FFE0]/50 focus:outline-none focus:ring-1 focus:ring-[#00FFE0]/20 transition-all"
            />
          </div>
        )}

        {orderType === "market" && (
          <div className="bg-[#141414] border border-[#1f1f1f] rounded p-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Price (USD)</span>
              <span className="text-white">Market</span>
            </div>
            {ticker && (
              <div className="flex justify-between text-xs mt-1">
                <span className="text-zinc-500">Last price</span>
                <span className="text-[#00FFE0]">
                  ${ticker.last_price.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-xs text-zinc-400 mb-1">
            Amount ({baseAsset})
          </label>
          <input
            type="text"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-[#141414] border border-[#1f1f1f] rounded p-2 text-sm focus:border-[#00FFE0]/50 focus:outline-none focus:ring-1 focus:ring-[#00FFE0]/20 transition-all"
          />
        </div>

        {/* Reduce Only & Time In Force */}
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

        {/* Total */}
        <div className="flex justify-between text-xs text-zinc-400 py-2 border-t border-[#1f1f1f]">
          <span>Estimated Total</span>
          <span className="text-white">
            ${estimatedTotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded p-2">
            {error}
          </div>
        )}

        {/* Submit Button */}
        {activeTab === "buy" ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full font-bold py-2 px-4 rounded transition-all ${
              isSubmitting
                ? "bg-zinc-600 text-zinc-400 cursor-not-allowed"
                : "bg-[#00FFE0] hover:bg-[#00FFE0]/90 text-black hover:shadow-[0_0_20px_rgba(0,255,224,0.4)]"
            }`}
          >
            {isSubmitting ? "Placing Order..." : `Buy / Long ${baseAsset}`}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full font-bold py-2 px-4 rounded transition-all ${
              isSubmitting
                ? "bg-zinc-600 text-zinc-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            }`}
          >
            {isSubmitting ? "Placing Order..." : `Sell / Short ${baseAsset}`}
          </button>
        )}
      </div>
    </div>
  );
};

export default TradePanel;
