import React from 'react';

const TradeHistoryRow = ({ price, amount, time, isBuy }: { price: string; amount: string; time: string; isBuy: boolean }) => (
  <div className={`flex justify-between text-xs ${isBuy ? 'text-green-500' : 'text-red-500'}`}>
    <span>{price}</span>
    <span>{amount}</span>
    <span>{time}</span>
  </div>
);

const TradeHistory = () => {
  const trades = [
    { price: '50031.5', amount: '0.98', time: '14:05:31', isBuy: false },
    { price: '50030.1', amount: '0.12', time: '14:05:28', isBuy: true },
    { price: '50032.8', amount: '0.15', time: '14:05:25', isBuy: false },
    { price: '50030.0', amount: '0.50', time: '14:05:22', isBuy: true },
    { price: '50028.5', amount: '0.23', time: '14:05:19', isBuy: true },
    { price: '50034.1', amount: '0.33', time: '14:05:15', isBuy: false },
  ];

  return (
    <div className="w-full text-white h-full flex flex-col">
      <div className="flex justify-between text-sm text-zinc-400 mb-2">
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
