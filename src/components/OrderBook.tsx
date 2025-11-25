"use client";

import Big from "big.js";
import { useState, useEffect, useRef, useLayoutEffect } from "react";

interface OrderBookEntry {
  price: string;
  quantity: string;
}

interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

interface OrderBookProps {
  orderBook: OrderBookData;
  lastPrice?: string | null;
  lastPriceColor?: string;
  markPrice?: string | null;
  baseAsset?: string;
}

export default function OrderBook({
  orderBook,
  lastPrice,
  lastPriceColor = "text-zinc-300",
  markPrice,
  baseAsset = "BTC",
}: OrderBookProps) {
  const [flashingItems, setFlashingItems] = useState<Set<string>>(new Set());
  const prevOrderBookRef = useRef<OrderBookData>({ bids: [], asks: [] });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTopRef = useRef<number>(0);
  const centerPriceRef = useRef<HTMLDivElement>(null);

  // 스크롤 위치 저장
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    scrollTopRef.current = e.currentTarget.scrollTop;
  };

  // 중앙으로 스크롤 이동
  const handleRecenter = () => {
    if (centerPriceRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const element = centerPriceRef.current;

      // getBoundingClientRect로 정확한 위치 계산
      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // 현재 스크롤 위치
      const currentScroll = container.scrollTop;

      // 요소의 컨테이너 내 상대 위치
      const elementRelativeTop = elementRect.top - containerRect.top;

      // 컨테이너 중앙에 요소 중앙이 오도록 계산
      const containerCenter = container.clientHeight / 2;
      const elementCenter = element.clientHeight / 2;

      const scrollTo =
        currentScroll + elementRelativeTop - containerCenter + elementCenter;

      container.scrollTop = scrollTo;
      scrollTopRef.current = scrollTo;
    }
  };

  // 초기 로드 시 중앙으로 스크롤
  const isInitializedRef = useRef(false);

  useLayoutEffect(() => {
    // 첫 데이터 로드 시 중앙으로 스크롤
    if (
      !isInitializedRef.current &&
      orderBook.bids.length > 0 &&
      orderBook.asks.length > 0
    ) {
      isInitializedRef.current = true;
      // 약간의 지연 후 중앙으로 스크롤 (DOM이 완전히 렌더링된 후)
      requestAnimationFrame(() => {
        handleRecenter();
      });
    } else if (scrollContainerRef.current) {
      // 이후 업데이트에서는 스크롤 위치 유지
      scrollContainerRef.current.scrollTop = scrollTopRef.current;
    }
  }, [orderBook]);

  // 오더북 변동 감지 및 플래시 효과
  useEffect(() => {
    const prevOrderBook = prevOrderBookRef.current;
    const newFlashingItems = new Set<string>();

    // 매수 호가 변동 감지
    orderBook.bids.forEach((bid) => {
      const prevBid = prevOrderBook.bids.find((b) => b.price === bid.price);
      if (!prevBid || prevBid.quantity !== bid.quantity) {
        newFlashingItems.add(`bid-${bid.price}`);
      }
    });

    // 매도 호가 변동 감지
    orderBook.asks.forEach((ask) => {
      const prevAsk = prevOrderBook.asks.find((a) => a.price === ask.price);
      if (!prevAsk || prevAsk.quantity !== ask.quantity) {
        newFlashingItems.add(`ask-${ask.price}`);
      }
    });

    if (newFlashingItems.size > 0) {
      setFlashingItems(newFlashingItems);
      setTimeout(() => setFlashingItems(new Set()), 500);
    }

    prevOrderBookRef.current = orderBook;
  }, [orderBook]);

  return (
    <div className="w-full h-full">
      <div className="bg-zinc-900 h-full p-2 flex flex-col">
        {/* 헤더 - 고정 */}
        <div className="grid grid-cols-3 gap-4 text-xs text-zinc-400 border-b border-zinc-700 pb-2 px-2 shrink-0">
          <div>Price (USD)</div>
          <div className="text-right">Size ({baseAsset})</div>
          <div className="text-right">Total ({baseAsset})</div>
        </div>

        {/* 스크롤 가능한 오더북 영역 */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto scrollbar-hide overscroll-contain"
        >
          {/* 매도 호가 (Asks) - 20호가 */}
          <div className="flex flex-col">
            {(() => {
              const askSlice = orderBook.asks.slice(0, 20);
              const reversedAsks = [...askSlice].reverse();
              const maxAskTotal = reversedAsks.reduce(
                (sum, a) => sum.plus(new Big(a.quantity || "0")),
                new Big(0)
              );

              return reversedAsks.map((ask, index) => {
                if (!ask.price) return null;

                const askTotal = reversedAsks
                  .slice(index)
                  .reduce(
                    (sum, a) => sum.plus(new Big(a.quantity || "0")),
                    new Big(0)
                  );
                const totalFillPercentage = maxAskTotal.gt(0)
                  ? askTotal.div(maxAskTotal).times(100).toNumber()
                  : 0;
                const quantityFillPercentage = askTotal.gt(0)
                  ? new Big(ask.quantity || "0")
                      .div(askTotal)
                      .times(totalFillPercentage)
                      .toNumber()
                  : 0;

                return (
                  <div
                    key={ask.price}
                    className={`relative grid grid-cols-3 gap-4 text-xs h-[20px] items-center hover:bg-zinc-800 px-2 overflow-hidden transition-colors duration-500 ${
                      flashingItems.has(`ask-${ask.price}`)
                        ? "bg-yellow-500/20"
                        : ""
                    }`}
                  >
                    <div
                      className="absolute inset-0 bg-red-500/20"
                      style={{
                        width: `${totalFillPercentage}%`,
                        right: 0,
                        left: "auto",
                      }}
                    />
                    <div
                      className="absolute inset-0 bg-red-500/40"
                      style={{
                        width: `${quantityFillPercentage}%`,
                        right: 0,
                        left: "auto",
                      }}
                    />
                    <div className="relative text-red-500">
                      {parseFloat(ask.price).toFixed(2)}
                    </div>
                    <div className="relative text-right">
                      {new Big(ask.quantity).toFixed(4)}
                    </div>
                    <div className="relative text-right text-zinc-300">
                      {askTotal.toFixed(4)}
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* 현재가 표시 */}
          <div
            ref={centerPriceRef}
            className="py-2 text-center border-y border-zinc-700"
          >
            <div className="flex justify-center items-center gap-2">
              <div className={`${lastPriceColor} font-bold text-lg`}>
                {lastPrice ? parseFloat(lastPrice).toFixed(2) : "-.--"}
              </div>
              <div className="text-zinc-400 text-sm">
                {markPrice ? parseFloat(markPrice).toFixed(2) : "-.--"}
              </div>
              <button
                onClick={handleRecenter}
                className="ml-2 px-2 py-0.5 text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                title="Recenter"
              >
                Recenter
              </button>
            </div>
          </div>

          {/* 매수 호가 (Bids) - 20호가 */}
          <div className="flex flex-col">
            {(() => {
              let bidTotal = new Big(0);
              const bidSlice = orderBook.bids.slice(0, 20);
              const maxBidTotal = bidSlice.reduce(
                (sum, b) => sum.plus(new Big(b.quantity || "0")),
                new Big(0)
              );

              return bidSlice.map((bid) => {
                if (!bid.price) return null;

                bidTotal = bidTotal.plus(new Big(bid.quantity || "0"));
                const totalFillPercentage = maxBidTotal.gt(0)
                  ? bidTotal.div(maxBidTotal).times(100).toNumber()
                  : 0;
                const quantityFillPercentage = bidTotal.gt(0)
                  ? new Big(bid.quantity || "0")
                      .div(bidTotal)
                      .times(totalFillPercentage)
                      .toNumber()
                  : 0;

                return (
                  <div
                    key={bid.price}
                    className={`relative grid grid-cols-3 gap-4 text-xs h-[20px] items-center hover:bg-zinc-800 px-2 overflow-hidden transition-colors duration-500 ${
                      flashingItems.has(`bid-${bid.price}`)
                        ? "bg-yellow-500/20"
                        : ""
                    }`}
                  >
                    <div
                      className="absolute inset-0 bg-green-500/20"
                      style={{
                        width: `${totalFillPercentage}%`,
                        right: 0,
                        left: "auto",
                      }}
                    />
                    <div
                      className="absolute inset-0 bg-green-500/40"
                      style={{
                        width: `${quantityFillPercentage}%`,
                        right: 0,
                        left: "auto",
                      }}
                    />
                    <div className="relative text-green-500">
                      {parseFloat(bid.price).toFixed(2)}
                    </div>
                    <div className="relative text-right">
                      {new Big(bid.quantity).toFixed(4)}
                    </div>
                    <div className="relative text-right text-zinc-300">
                      {bidTotal.toFixed(4)}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
