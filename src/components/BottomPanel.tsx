"use client";

import { useState } from "react";

type TabType = "positions" | "openOrders" | "orderHistory" | "balances";

// Mock data for demonstration
const mockPositions = [
  {
    symbol: "BTC_USDM_PERP",
    side: "Long",
    size: "0.5",
    entryPrice: "97250.00",
    markPrice: "97500.00",
    pnl: "+125.00",
    pnlPercent: "+0.26%",
    leverage: "10x",
    liquidationPrice: "87525.00",
  },
];

const mockOpenOrders = [
  {
    id: "1",
    symbol: "BTC_USDM_PERP",
    side: "Buy",
    type: "Limit",
    price: "96000.00",
    amount: "0.1",
    filled: "0",
    status: "Open",
    time: "2024-01-15 14:30:22",
  },
  {
    id: "2",
    symbol: "ETH_USDM_PERP",
    side: "Sell",
    type: "Limit",
    price: "3500.00",
    amount: "1.5",
    filled: "0",
    status: "Open",
    time: "2024-01-15 14:25:10",
  },
];

const mockOrderHistory = [
  {
    id: "101",
    symbol: "BTC_USDM_PERP",
    side: "Buy",
    type: "Market",
    price: "97250.00",
    amount: "0.5",
    filled: "0.5",
    status: "Filled",
    time: "2024-01-15 12:00:00",
  },
];

const mockBalances = [
  { asset: "USDM", available: "10,000.00", inOrder: "960.00", total: "10,960.00" },
  { asset: "BTC", available: "0.5", inOrder: "0", total: "0.5" },
  { asset: "ETH", available: "2.0", inOrder: "0", total: "2.0" },
];

export default function BottomPanel() {
  const [activeTab, setActiveTab] = useState<TabType>("positions");

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: "positions", label: "Positions", count: mockPositions.length },
    { key: "openOrders", label: "Open Orders", count: mockOpenOrders.length },
    { key: "orderHistory", label: "Order History" },
    { key: "balances", label: "Balances" },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      {/* 탭 헤더 */}
      <div className="flex border-b border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "text-white border-b-2 border-blue-500"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-zinc-700 rounded">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="h-[200px] overflow-y-auto scrollbar-hide">
        {activeTab === "positions" && <PositionsTable />}
        {activeTab === "openOrders" && <OpenOrdersTable />}
        {activeTab === "orderHistory" && <OrderHistoryTable />}
        {activeTab === "balances" && <BalancesTable />}
      </div>
    </div>
  );
}

function PositionsTable() {
  if (mockPositions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
        No open positions
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="text-zinc-400 text-xs sticky top-0 bg-zinc-900">
        <tr className="border-b border-zinc-800">
          <th className="text-left px-4 py-2 font-medium">Symbol</th>
          <th className="text-left px-4 py-2 font-medium">Side</th>
          <th className="text-right px-4 py-2 font-medium">Size</th>
          <th className="text-right px-4 py-2 font-medium">Entry Price</th>
          <th className="text-right px-4 py-2 font-medium">Mark Price</th>
          <th className="text-right px-4 py-2 font-medium">PnL (ROE%)</th>
          <th className="text-right px-4 py-2 font-medium">Leverage</th>
          <th className="text-right px-4 py-2 font-medium">Liq. Price</th>
          <th className="text-center px-4 py-2 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {mockPositions.map((pos, idx) => {
          const isPnlPositive = pos.pnl.startsWith("+");
          return (
            <tr key={idx} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
              <td className="px-4 py-3 text-white">{pos.symbol.replace(/_/g, "/")}</td>
              <td className={`px-4 py-3 ${pos.side === "Long" ? "text-green-500" : "text-red-500"}`}>
                {pos.side}
              </td>
              <td className="px-4 py-3 text-right text-white">{pos.size}</td>
              <td className="px-4 py-3 text-right text-zinc-300">${pos.entryPrice}</td>
              <td className="px-4 py-3 text-right text-zinc-300">${pos.markPrice}</td>
              <td className={`px-4 py-3 text-right ${isPnlPositive ? "text-green-500" : "text-red-500"}`}>
                ${pos.pnl} ({pos.pnlPercent})
              </td>
              <td className="px-4 py-3 text-right text-yellow-500">{pos.leverage}</td>
              <td className="px-4 py-3 text-right text-zinc-400">${pos.liquidationPrice}</td>
              <td className="px-4 py-3 text-center">
                <button className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded mr-1">
                  TP/SL
                </button>
                <button className="px-2 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded">
                  Close
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function OpenOrdersTable() {
  if (mockOpenOrders.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
        No open orders
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="text-zinc-400 text-xs sticky top-0 bg-zinc-900">
        <tr className="border-b border-zinc-800">
          <th className="text-left px-4 py-2 font-medium">Time</th>
          <th className="text-left px-4 py-2 font-medium">Symbol</th>
          <th className="text-left px-4 py-2 font-medium">Type</th>
          <th className="text-left px-4 py-2 font-medium">Side</th>
          <th className="text-right px-4 py-2 font-medium">Price</th>
          <th className="text-right px-4 py-2 font-medium">Amount</th>
          <th className="text-right px-4 py-2 font-medium">Filled</th>
          <th className="text-center px-4 py-2 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {mockOpenOrders.map((order) => (
          <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
            <td className="px-4 py-3 text-zinc-400">{order.time}</td>
            <td className="px-4 py-3 text-white">{order.symbol.replace(/_/g, "/")}</td>
            <td className="px-4 py-3 text-zinc-300">{order.type}</td>
            <td className={`px-4 py-3 ${order.side === "Buy" ? "text-green-500" : "text-red-500"}`}>
              {order.side}
            </td>
            <td className="px-4 py-3 text-right text-zinc-300">${order.price}</td>
            <td className="px-4 py-3 text-right text-white">{order.amount}</td>
            <td className="px-4 py-3 text-right text-zinc-400">{order.filled}</td>
            <td className="px-4 py-3 text-center">
              <button className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded mr-1">
                Edit
              </button>
              <button className="px-2 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded">
                Cancel
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function OrderHistoryTable() {
  if (mockOrderHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
        No order history
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="text-zinc-400 text-xs sticky top-0 bg-zinc-900">
        <tr className="border-b border-zinc-800">
          <th className="text-left px-4 py-2 font-medium">Time</th>
          <th className="text-left px-4 py-2 font-medium">Symbol</th>
          <th className="text-left px-4 py-2 font-medium">Type</th>
          <th className="text-left px-4 py-2 font-medium">Side</th>
          <th className="text-right px-4 py-2 font-medium">Price</th>
          <th className="text-right px-4 py-2 font-medium">Amount</th>
          <th className="text-right px-4 py-2 font-medium">Filled</th>
          <th className="text-center px-4 py-2 font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        {mockOrderHistory.map((order) => (
          <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
            <td className="px-4 py-3 text-zinc-400">{order.time}</td>
            <td className="px-4 py-3 text-white">{order.symbol.replace(/_/g, "/")}</td>
            <td className="px-4 py-3 text-zinc-300">{order.type}</td>
            <td className={`px-4 py-3 ${order.side === "Buy" ? "text-green-500" : "text-red-500"}`}>
              {order.side}
            </td>
            <td className="px-4 py-3 text-right text-zinc-300">${order.price}</td>
            <td className="px-4 py-3 text-right text-white">{order.amount}</td>
            <td className="px-4 py-3 text-right text-zinc-400">{order.filled}</td>
            <td className="px-4 py-3 text-center">
              <span className={`px-2 py-0.5 text-xs rounded ${
                order.status === "Filled"
                  ? "bg-green-500/20 text-green-400"
                  : order.status === "Cancelled"
                  ? "bg-zinc-500/20 text-zinc-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }`}>
                {order.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BalancesTable() {
  return (
    <table className="w-full text-sm">
      <thead className="text-zinc-400 text-xs sticky top-0 bg-zinc-900">
        <tr className="border-b border-zinc-800">
          <th className="text-left px-4 py-2 font-medium">Asset</th>
          <th className="text-right px-4 py-2 font-medium">Available</th>
          <th className="text-right px-4 py-2 font-medium">In Order</th>
          <th className="text-right px-4 py-2 font-medium">Total</th>
          <th className="text-center px-4 py-2 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {mockBalances.map((balance) => (
          <tr key={balance.asset} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center text-xs font-bold">
                  {balance.asset.charAt(0)}
                </div>
                <span className="text-white font-medium">{balance.asset}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-right text-white">{balance.available}</td>
            <td className="px-4 py-3 text-right text-zinc-400">{balance.inOrder}</td>
            <td className="px-4 py-3 text-right text-zinc-300">{balance.total}</td>
            <td className="px-4 py-3 text-center">
              <button className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded mr-1">
                Deposit
              </button>
              <button className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded">
                Withdraw
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
