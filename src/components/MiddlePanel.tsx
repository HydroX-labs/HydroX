"use client";

import React, { useState, useEffect, useRef } from "react";
import OrderBook from "./OrderBook";
import TradeHistory from "./TradeHistory";

// Data types moved here to be used by the state in this container
interface OrderBookEntry {
  price: string;
  quantity: string;
}

interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

interface MiddlePanelProps {
  symbol: string;
}

const MiddlePanel = ({ symbol }: MiddlePanelProps) => {
  const [activeTab, setActiveTab] = useState("orderbook");
  const [orderBook, setOrderBook] = useState<OrderBookData>({
    bids: [],
    asks: [],
  });
  const [lastPrice, setLastPrice] = useState<string | null>(null);
  const [lastPriceColor, setLastPriceColor] = useState<string>("text-zinc-300");
  const [markPrice, setMarkPrice] = useState<string | null>(null);

  // Use refs to store the current state of bids and asks for reconciliation
  const currentBidsRef = useRef<Map<string, string>>(new Map());
  const currentAsksRef = useRef<Map<string, string>>(new Map());

  const DISPLAY_LEVELS = 20; // 화면에 표시할 호가 수
  const BUFFER_LEVELS = 50; // Map에 보관할 호가 수 (버퍼)

  // Helper function to apply incremental updates to a single side
  const applyUpdate = (
    incomingLevels: [string, string][],
    currentMapRef: React.MutableRefObject<Map<string, string>>
  ) => {
    const currentMap = currentMapRef.current;

    incomingLevels.forEach(([price, quantity]) => {
      const qty = parseFloat(quantity);
      if (qty === 0) {
        currentMap.delete(price);
      } else {
        currentMap.set(price, quantity);
      }
    });
  };

  // Helper function to get sorted and filtered order book
  const getOrderBook = (): OrderBookData => {
    // 매수호가: 높은 가격순 정렬
    const bids = Array.from(currentBidsRef.current.entries())
      .map(([price, quantity]) => ({ price, quantity }))
      .sort((a, b) => parseFloat(b.price) - parseFloat(a.price));

    // 매도호가: 낮은 가격순 정렬
    const asks = Array.from(currentAsksRef.current.entries())
      .map(([price, quantity]) => ({ price, quantity }))
      .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

    // 최고 매수가와 최저 매도가
    const bestBid = bids.length > 0 ? parseFloat(bids[0].price) : 0;
    const bestAsk = asks.length > 0 ? parseFloat(asks[0].price) : Infinity;

    // 교차된 가격대 필터링
    // 매수호가는 최저 매도가보다 낮아야 함
    const filteredBids = bids.filter((b) => parseFloat(b.price) < bestAsk);
    // 매도호가는 최고 매수가보다 높아야 함
    const filteredAsks = asks.filter((a) => parseFloat(a.price) > bestBid);

    // Map 정리 (버퍼 크기만큼 유지)
    currentBidsRef.current = new Map(
      filteredBids.slice(0, BUFFER_LEVELS).map((e) => [e.price, e.quantity])
    );
    currentAsksRef.current = new Map(
      filteredAsks.slice(0, BUFFER_LEVELS).map((e) => [e.price, e.quantity])
    );

    return {
      bids: filteredBids.slice(0, DISPLAY_LEVELS),
      asks: filteredAsks.slice(0, DISPLAY_LEVELS),
    };
  };

  useEffect(() => {
    // This logic only needs to run when the orderbook tab is active
    if (activeTab !== "orderbook") {
      return;
    }

    // 심볼 변경 시 데이터 초기화
    currentBidsRef.current = new Map();
    currentAsksRef.current = new Map();
    setOrderBook({ bids: [], asks: [] });
    setLastPrice(null);
    setMarkPrice(null);

    let ws: WebSocket;

    const init = async () => {
      // Stage 1: Fetch initial snapshot via REST API
      try {
        const response = await fetch(
          `/api/backpack/orderbook?symbol=${symbol}`
        );
        if (!response.ok) {
          console.error(`API Error: ${response.status} ${response.statusText}`);
          throw new Error("Failed to fetch initial order book");
        }
        const data = await response.json();

        // Initialize currentMaps with initial REST data
        const initialBids = data.bids.map(
          ([price, quantity]: [string, string]) => ({ price, quantity })
        );
        const initialAsks = data.asks.map(
          ([price, quantity]: [string, string]) => ({ price, quantity })
        );

        currentBidsRef.current = new Map(
          initialBids.map((entry: OrderBookEntry) => [
            entry.price,
            entry.quantity,
          ])
        );
        currentAsksRef.current = new Map(
          initialAsks.map((entry: OrderBookEntry) => [
            entry.price,
            entry.quantity,
          ])
        );

        setOrderBook(getOrderBook());
      } catch (error) {
        console.error(
          "Failed to fetch initial order book, proceeding with WebSocket only.",
          error
        );
      }

      // Stage 2: Connect to WebSocket for live updates
      // Backpack WebSocket은 USDC 심볼을 사용하므로 USDM -> USDC 변환
      const apiSymbol = symbol.replace(/USDM/g, "USDC");
      ws = new WebSocket("wss://ws.backpack.exchange/");

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            method: "SUBSCRIBE",
            params: [
              `depth.200ms.${apiSymbol}`,
              `trade.${apiSymbol}`,
              `markPrice.${apiSymbol}`,
            ],
          })
        );
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.data?.e === "depth") {
          const { b, a } = message.data;

          // 양쪽 업데이트 적용
          applyUpdate(b, currentBidsRef);
          applyUpdate(a, currentAsksRef);

          // 교차 필터링 후 상태 업데이트
          setOrderBook(getOrderBook());
        } else if (message.data?.e === "trade") {
          setLastPrice(message.data.p);
          setLastPriceColor(message.data.m ? "text-red-500" : "text-green-500");
        } else if (message.data?.e === "markPrice") {
          setMarkPrice(message.data.p);
        }
      };

      ws.onerror = (error) => console.error("WebSocket Error:", error);
      ws.onclose = () => {
        console.log("WebSocket closed, attempting to reconnect...");
        setTimeout(init, 1000); // Reconnect on close
      };
    };

    init();

    return () => {
      if (ws) {
        ws.onclose = null; // Prevent multiple reconnect attempts
        ws.close();
      }
    };
  }, [activeTab, symbol]); // Rerun this effect when the active tab or symbol changes

  return (
    <div className="w-full h-full flex flex-col relative rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <div className="flex border-b border-zinc-700 shrink-0">
        <button
          onClick={() => setActiveTab("orderbook")}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === "orderbook"
              ? "border-b-2 border-blue-500 text-white"
              : "text-zinc-400"
          }`}
        >
          Order Book
        </button>
        <button
          onClick={() => setActiveTab("tradehistory")}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === "tradehistory"
              ? "border-b-2 border-blue-500 text-white"
              : "text-zinc-400"
          }`}
        >
          Trade History
        </button>
      </div>
      <div className="pt-0 flex-grow overflow-hidden">
        {activeTab === "orderbook" ? (
          <OrderBook
            orderBook={orderBook}
            lastPrice={lastPrice}
            lastPriceColor={lastPriceColor}
            markPrice={markPrice}
            baseAsset={symbol.split("_")[0]}
          />
        ) : (
          <TradeHistory />
        )}
      </div>
    </div>
  );
};

export default MiddlePanel;
