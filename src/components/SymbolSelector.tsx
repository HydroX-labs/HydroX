"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SymbolSelectorProps {
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

const AVAILABLE_SYMBOLS = [
  { symbol: "BTC_USDM_PERP", display: "BTC/USDM", type: "PERP" },
  { symbol: "ETH_USDM_PERP", display: "ETH/USDM", type: "PERP" },
  { symbol: "SOL_USDM_PERP", display: "SOL/USDM", type: "PERP" },
  { symbol: "BTC_USDM", display: "BTC/USDM", type: "SPOT" },
  { symbol: "ETH_USDM", display: "ETH/USDM", type: "SPOT" },
  { symbol: "SOL_USDM", display: "SOL/USDM", type: "SPOT" },
];

const SymbolSelector = ({
  selectedSymbol,
  onSymbolChange,
}: SymbolSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const currentSymbol = AVAILABLE_SYMBOLS.find(
    (s) => s.symbol === selectedSymbol
  );
  const displayName =
    currentSymbol?.display || selectedSymbol.replace(/_/g, "/");
  const symbolType =
    currentSymbol?.type || (selectedSymbol.includes("PERP") ? "PERP" : "SPOT");

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    onSymbolChange(symbol);
    setIsOpen(false);

    // URL 변경: PERP면 /perp/XXX_USDM, SPOT이면 /spot/XXX_USDM
    const isPerp = symbol.endsWith("_PERP");
    const baseSymbol = symbol.replace(/_PERP$/, "");
    const route = isPerp ? `/perp/${baseSymbol}` : `/spot/${baseSymbol}`;
    router.push(route);
  };

  return (
    <div className="px-4 py-3 flex items-center">
      <div className="flex items-center gap-4">
        {/* 거래쌍 선택 드롭다운 */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <span className="text-white font-bold text-lg">{displayName}</span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded ${
                symbolType === "PERP"
                  ? "bg-purple-500/20 text-purple-400"
                  : "bg-blue-500/20 text-blue-400"
              }`}
            >
              {symbolType}
            </span>
            <svg
              className={`w-4 h-4 text-zinc-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* 드롭다운 메뉴 */}
          {isOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden">
              {/* PERP 섹션 */}
              <div className="px-3 py-2 text-xs text-zinc-500 border-b border-zinc-700">
                Prepetuals
              </div>
              {AVAILABLE_SYMBOLS.filter((s) => s.type === "PERP").map(
                (item) => (
                  <button
                    key={item.symbol}
                    onClick={() => handleSelect(item.symbol)}
                    className={`w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-700 transition-colors ${
                      selectedSymbol === item.symbol ? "bg-zinc-700" : ""
                    }`}
                  >
                    <span className="text-white">{item.display}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                      PERP
                    </span>
                  </button>
                )
              )}

              {/* SPOT 섹션 */}
              <div className="px-3 py-2 text-xs text-zinc-500 border-y border-zinc-700">
                Spot
              </div>
              {AVAILABLE_SYMBOLS.filter((s) => s.type === "SPOT").map(
                (item) => (
                  <button
                    key={item.symbol}
                    onClick={() => handleSelect(item.symbol)}
                    className={`w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-700 transition-colors ${
                      selectedSymbol === item.symbol ? "bg-zinc-700" : ""
                    }`}
                  >
                    <span className="text-white">{item.display}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                      SPOT
                    </span>
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymbolSelector;
