"use client";

interface MarketInfoProps {
  symbol: string;
}

export default function MarketInfo({ symbol }: MarketInfoProps) {
  // TODO: API에서 시장 데이터 로드
  const data = null;

  const formatPrice = (value: string | null) => {
    if (!value) return "--";
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
          <span className="text-xl font-bold text-zinc-500">
            $--
          </span>
          <span className="text-xs text-zinc-600">
            Mark $--
          </span>
        </div>

        {/* 구분선 */}
        <div className="h-8 w-px bg-[#1f1f1f]" />

        {/* 24h 변동률 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase">24h Change</span>
          <span className="text-sm font-medium text-zinc-500">--%</span>
        </div>

        {/* 24h 고가 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase">24h High</span>
          <span className="text-sm text-zinc-500">$--</span>
        </div>

        {/* 24h 저가 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase">24h Low</span>
          <span className="text-sm text-zinc-500">$--</span>
        </div>

        {/* 24h 거래량 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase">24h Volume</span>
          <span className="text-sm text-zinc-500">-- {symbol.split("_")[0]}</span>
        </div>

        {/* 24h 거래대금 */}
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase">24h Turnover</span>
          <span className="text-sm text-zinc-500">$--</span>
        </div>
      </div>
    </div>
  );
}
