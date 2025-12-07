"use client";

interface MarketInfoProps {
  symbol: string;
}

// Mock 시장 데이터
const mockMarketData: Record<string, {
  lastPrice: string;
  priceChangePercent: number;
  high: string;
  low: string;
  volume: string;
  quoteVolume: string;
  markPrice: string;
}> = {
  "BTC_USDM_PERP": {
    lastPrice: "97250.50",
    priceChangePercent: 2.35,
    high: "98500.00",
    low: "95200.00",
    volume: "1234.56",
    quoteVolume: "120456789",
    markPrice: "97248.00",
  },
  "ETH_USDM_PERP": {
    lastPrice: "3456.78",
    priceChangePercent: -1.24,
    high: "3520.00",
    low: "3380.00",
    volume: "8765.43",
    quoteVolume: "30234567",
    markPrice: "3455.50",
  },
  "SOL_USDM_PERP": {
    lastPrice: "185.42",
    priceChangePercent: 5.67,
    high: "192.00",
    low: "175.00",
    volume: "45678.90",
    quoteVolume: "8456789",
    markPrice: "185.38",
  },
};

export default function MarketInfo({ symbol }: MarketInfoProps) {
  const data = mockMarketData[symbol] || mockMarketData["BTC_USDM_PERP"];
  const isPositive = data.priceChangePercent >= 0;

  const formatNumber = (value: string, decimals = 2) => {
    const num = parseFloat(value);
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + "K";
    }
    return num.toFixed(decimals);
  };

  const formatPrice = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1000) {
      return num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return num.toFixed(4);
  };

  return (
    <div className="px-6 py-2 flex-1 flex items-center">
      <div className="flex items-center gap-8">
        {/* 현재 가격 */}
        <div className="flex flex-col">
          <span
            className={`text-xl font-bold ${
              isPositive ? "text-[#00FFE0] drop-shadow-[0_0_8px_rgba(0,255,224,0.4)]" : "text-red-500"
            }`}
          >
            ${formatPrice(data.lastPrice)}
          </span>
          <span className="text-xs text-zinc-500">
            Mark ${formatPrice(data.markPrice)}
          </span>
        </div>

        {/* 구분선 */}
        <div className="h-8 w-px bg-[#1f1f1f]" />

        {/* 24h 변동률 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase">24h Change</span>
          <span
            className={`text-sm font-medium ${
              isPositive ? "text-[#00FFE0]" : "text-red-500"
            }`}
          >
            {isPositive ? "+" : ""}
            {data.priceChangePercent.toFixed(2)}%
          </span>
        </div>

        {/* 24h 고가 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase">24h High</span>
          <span className="text-sm text-zinc-200">${formatPrice(data.high)}</span>
        </div>

        {/* 24h 저가 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase">24h Low</span>
          <span className="text-sm text-zinc-200">${formatPrice(data.low)}</span>
        </div>

        {/* 24h 거래량 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase">24h Volume</span>
          <span className="text-sm text-zinc-200">
            {formatNumber(data.volume, 2)} {symbol.split("_")[0]}
          </span>
        </div>

        {/* 24h 거래대금 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase">24h Turnover</span>
          <span className="text-sm text-zinc-200">
            ${formatNumber(data.quoteVolume)}
          </span>
        </div>
      </div>
    </div>
  );
}

