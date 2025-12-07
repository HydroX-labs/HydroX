"use client";

import { useState } from "react";

type TabType = "positions" | "openOrders" | "orderHistory" | "balances";

// TODO: API에서 데이터 로드
const positions: {
  symbol: string;
  side: string;
  size: string;
  entryPrice: string;
  markPrice: string;
  pnl: string;
  pnlPercent: string;
  leverage: string;
  liquidationPrice: string;
}[] = [];

const openOrders: {
  id: string;
  symbol: string;
  side: string;
  type: string;
  price: string;
  amount: string;
  filled: string;
  status: string;
  time: string;
}[] = [];

const orderHistory: {
  id: string;
  symbol: string;
  side: string;
  type: string;
  price: string;
  amount: string;
  filled: string;
  status: string;
  time: string;
}[] = [];

const balances: {
  asset: string;
  available: string;
  inOrder: string;
  total: string;
}[] = [];

export default function BottomPanel() {
  const [activeTab, setActiveTab] = useState<TabType>("positions");

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: "positions", label: "Positions", count: positions.length },
    { key: "openOrders", label: "Open Orders", count: openOrders.length },
    { key: "orderHistory", label: "Order History" },
    { key: "balances", label: "Balances" },
  ];

  return (
    <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg overflow-hidden">
      {/* 탭 헤더 */}
      <div className="flex border-b border-[#1f1f1f]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "text-[#00FFE0] border-b-2 border-[#00FFE0]"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded ${
                activeTab === tab.key
                  ? "bg-[#00FFE0]/20 text-[#00FFE0]"
                  : "bg-zinc-700 text-zinc-300"
              }`}>
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

function EmptyState({ message, icon }: { message: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-zinc-500">
      <div className="opacity-30 mb-2">{icon}</div>
      <p className="text-sm">{message}</p>
    </div>
  );
}

function PositionsTable() {
  if (positions.length === 0) {
    return (
      <EmptyState
        message="No open positions"
        icon={
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
      />
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="text-zinc-400 text-xs sticky top-0 bg-[#0f0f0f]">
        <tr className="border-b border-[#1f1f1f]">
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
        {positions.map((pos, idx) => {
          const isPnlPositive = pos.pnl.startsWith("+");
          return (
            <tr key={idx} className="border-b border-[#1f1f1f]/50 hover:bg-[#00FFE0]/5 transition-colors">
              <td className="px-4 py-3 text-white">{pos.symbol.replace(/_/g, "/")}</td>
              <td className={`px-4 py-3 ${pos.side === "Long" ? "text-[#00FFE0]" : "text-red-500"}`}>
                {pos.side}
              </td>
              <td className="px-4 py-3 text-right text-white">{pos.size}</td>
              <td className="px-4 py-3 text-right text-zinc-300">${pos.entryPrice}</td>
              <td className="px-4 py-3 text-right text-zinc-300">${pos.markPrice}</td>
              <td className={`px-4 py-3 text-right ${isPnlPositive ? "text-[#00FFE0]" : "text-red-500"}`}>
                ${pos.pnl} ({pos.pnlPercent})
              </td>
              <td className="px-4 py-3 text-right text-[#00FFE0]/70">{pos.leverage}</td>
              <td className="px-4 py-3 text-right text-zinc-400">${pos.liquidationPrice}</td>
              <td className="px-4 py-3 text-center">
                <button className="px-2 py-1 text-xs bg-[#1a1a1a] hover:bg-[#00FFE0]/10 hover:text-[#00FFE0] border border-[#1f1f1f] hover:border-[#00FFE0]/30 rounded mr-1 transition-all">
                  TP/SL
                </button>
                <button className="px-2 py-1 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded transition-all">
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
  if (openOrders.length === 0) {
    return (
      <EmptyState
        message="No open orders"
        icon={
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        }
      />
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="text-zinc-400 text-xs sticky top-0 bg-[#0f0f0f]">
        <tr className="border-b border-[#1f1f1f]">
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
        {openOrders.map((order) => (
          <tr key={order.id} className="border-b border-[#1f1f1f]/50 hover:bg-[#00FFE0]/5 transition-colors">
            <td className="px-4 py-3 text-zinc-400">{order.time}</td>
            <td className="px-4 py-3 text-white">{order.symbol.replace(/_/g, "/")}</td>
            <td className="px-4 py-3 text-zinc-300">{order.type}</td>
            <td className={`px-4 py-3 ${order.side === "Buy" ? "text-[#00FFE0]" : "text-red-500"}`}>
              {order.side}
            </td>
            <td className="px-4 py-3 text-right text-zinc-300">${order.price}</td>
            <td className="px-4 py-3 text-right text-white">{order.amount}</td>
            <td className="px-4 py-3 text-right text-zinc-400">{order.filled}</td>
            <td className="px-4 py-3 text-center">
              <button className="px-2 py-1 text-xs bg-[#1a1a1a] hover:bg-[#00FFE0]/10 hover:text-[#00FFE0] border border-[#1f1f1f] hover:border-[#00FFE0]/30 rounded mr-1 transition-all">
                Edit
              </button>
              <button className="px-2 py-1 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded transition-all">
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
  if (orderHistory.length === 0) {
    return (
      <EmptyState
        message="No order history"
        icon={
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="text-zinc-400 text-xs sticky top-0 bg-[#0f0f0f]">
        <tr className="border-b border-[#1f1f1f]">
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
        {orderHistory.map((order) => (
          <tr key={order.id} className="border-b border-[#1f1f1f]/50 hover:bg-[#00FFE0]/5 transition-colors">
            <td className="px-4 py-3 text-zinc-400">{order.time}</td>
            <td className="px-4 py-3 text-white">{order.symbol.replace(/_/g, "/")}</td>
            <td className="px-4 py-3 text-zinc-300">{order.type}</td>
            <td className={`px-4 py-3 ${order.side === "Buy" ? "text-[#00FFE0]" : "text-red-500"}`}>
              {order.side}
            </td>
            <td className="px-4 py-3 text-right text-zinc-300">${order.price}</td>
            <td className="px-4 py-3 text-right text-white">{order.amount}</td>
            <td className="px-4 py-3 text-right text-zinc-400">{order.filled}</td>
            <td className="px-4 py-3 text-center">
              <span className={`px-2 py-0.5 text-xs rounded border ${
                order.status === "Filled"
                  ? "bg-[#00FFE0]/10 text-[#00FFE0] border-[#00FFE0]/30"
                  : order.status === "Cancelled"
                  ? "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"
                  : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
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
  if (balances.length === 0) {
    return (
      <EmptyState
        message="No assets"
        icon={
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        }
      />
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="text-zinc-400 text-xs sticky top-0 bg-[#0f0f0f]">
        <tr className="border-b border-[#1f1f1f]">
          <th className="text-left px-4 py-2 font-medium">Asset</th>
          <th className="text-right px-4 py-2 font-medium">Available</th>
          <th className="text-right px-4 py-2 font-medium">In Order</th>
          <th className="text-right px-4 py-2 font-medium">Total</th>
          <th className="text-center px-4 py-2 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {balances.map((balance) => (
          <tr key={balance.asset} className="border-b border-[#1f1f1f]/50 hover:bg-[#00FFE0]/5 transition-colors">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#00FFE0]/10 border border-[#00FFE0]/30 rounded-full flex items-center justify-center text-xs font-bold text-[#00FFE0]">
                  {balance.asset.charAt(0)}
                </div>
                <span className="text-white font-medium">{balance.asset}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-right text-white">{balance.available}</td>
            <td className="px-4 py-3 text-right text-zinc-400">{balance.inOrder}</td>
            <td className="px-4 py-3 text-right text-zinc-300">{balance.total}</td>
            <td className="px-4 py-3 text-center">
              <button className="px-2 py-1 text-xs bg-[#00FFE0]/10 text-[#00FFE0] hover:bg-[#00FFE0]/20 border border-[#00FFE0]/30 rounded mr-1 transition-all">
                Deposit
              </button>
              <button className="px-2 py-1 text-xs bg-[#1a1a1a] hover:bg-[#1f1f1f] border border-[#1f1f1f] rounded transition-all">
                Withdraw
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
