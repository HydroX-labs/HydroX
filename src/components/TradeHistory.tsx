"use client";

const TradeHistory = () => {
  // TODO: API에서 거래 내역 로드
  const trades: { price: string; amount: string; time: string; isBuy: boolean }[] = [];

  return (
    <div className="w-full text-white h-full flex flex-col">
      <div className="flex justify-between text-sm text-zinc-500 mb-2">
        <span>Price (USD)</span>
        <span>Amount (BTC)</span>
        <span>Time</span>
      </div>
      <div className="flex flex-col gap-2 flex-grow overflow-auto">
        {trades.length > 0 ? (
          trades.map((trade, index) => (
            <div
              key={index}
              className={`flex justify-between text-xs font-mono ${
                trade.isBuy ? "text-[#00FFE0]" : "text-red-500"
              }`}
            >
              <span>{trade.price}</span>
              <span className="text-zinc-300">{trade.amount}</span>
              <span className="text-zinc-500">{trade.time}</span>
            </div>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-zinc-600">
              <svg className="w-8 h-8 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-xs">No trades yet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeHistory;
