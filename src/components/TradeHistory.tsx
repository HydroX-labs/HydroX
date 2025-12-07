import React from 'react';

const TradeHistoryRow = ({ price, amount, time, isBuy }: { price: string; amount: string; time: string; isBuy: boolean }) => (
  <div className={`flex justify-between text-xs font-mono ${isBuy ? 'text-[#00FFE0]' : 'text-red-500'}`}>
    <span>{price}</span>
    <span className="text-zinc-300">{amount}</span>
    <span className="text-zinc-500">{time}</span>
  </div>
);

const TradeHistory = () => {
  // Mock 거래 내역 데이터
  const trades = [
    { price: '97,250.50', amount: '0.98', time: '14:05:31', isBuy: false },
    { price: '97,248.10', amount: '0.12', time: '14:05:28', isBuy: true },
    { price: '97,252.80', amount: '0.15', time: '14:05:25', isBuy: false },
    { price: '97,245.00', amount: '0.50', time: '14:05:22', isBuy: true },
    { price: '97,243.50', amount: '0.23', time: '14:05:19', isBuy: true },
    { price: '97,254.10', amount: '0.33', time: '14:05:15', isBuy: false },
    { price: '97,240.00', amount: '0.45', time: '14:05:12', isBuy: true },
    { price: '97,255.80', amount: '0.18', time: '14:05:09', isBuy: false },
    { price: '97,238.50', amount: '0.67', time: '14:05:06', isBuy: true },
    { price: '97,260.00', amount: '0.22', time: '14:05:03', isBuy: false },
  ];

  return (
    <div className="w-full text-white h-full flex flex-col">
      <div className="flex justify-between text-sm text-zinc-500 mb-2">
        <span>Price (USD)</span>
        <span>Amount (BTC)</span>
        <span>Time</span>
      </div>
      <div className="flex flex-col gap-2 flex-grow overflow-auto">
        {trades.map((trade, index) => (
          <TradeHistoryRow key={index} {...trade} />
        ))}
      </div>
    </div>
  );
};

export default TradeHistory;

