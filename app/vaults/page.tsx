"use client";

import { useState } from "react";

// Mock data for the vault
const mockVaultData = {
  name: "BaobobX Liquidity Provider",
  address:
    "DdzFFzCqrhsszHTvbjTmYje5hehGbadkT6WgWbaqCy5XNxNttsPNF13eAjjBHYT7JaLJz2XVxiucam1EvwBRPSTiCrT4TNCBas4hfzic",
  tvl: 2_847_392.45,
  apy: 24.7,
  dailyChange: 0.82,
  weeklyChange: 5.43,
  monthlyChange: 18.92,
  depositors: 1_247,
  capacity: 5_000_000,
  manager: "Quantitative Labs",
  managementFee: 2.0,
  performanceFee: 20.0,
  lockPeriod: "7 days",
  minDeposit: 100,
  strategy:
    "Automated momentum trading strategy utilizing perpetual futures on BTC-USDC pair with dynamic risk management.",
};

const mockPerformanceData = [
  { date: "Jan", value: 100 },
  { date: "Feb", value: 108 },
  { date: "Mar", value: 104 },
  { date: "Apr", value: 115 },
  { date: "May", value: 122 },
  { date: "Jun", value: 118 },
  { date: "Jul", value: 131 },
  { date: "Aug", value: 142 },
  { date: "Sep", value: 138 },
  { date: "Oct", value: 156 },
  { date: "Nov", value: 168 },
  { date: "Dec", value: 182 },
];

const mockTransactions = [
  {
    type: "Deposit",
    amount: 5000,
    time: "2 hours ago",
    address: "0x1a2b...3c4d",
    status: "Completed",
  },
  {
    type: "Withdrawal",
    amount: 2500,
    time: "5 hours ago",
    address: "0x5e6f...7g8h",
    status: "Completed",
  },
  {
    type: "Deposit",
    amount: 10000,
    time: "1 day ago",
    address: "0x9i0j...1k2l",
    status: "Completed",
  },
  {
    type: "Deposit",
    amount: 3200,
    time: "2 days ago",
    address: "0x3m4n...5o6p",
    status: "Completed",
  },
  {
    type: "Withdrawal",
    amount: 1800,
    time: "3 days ago",
    address: "0x7q8r...9s0t",
    status: "Completed",
  },
];

export default function VaultsPage() {
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [historyTab, setHistoryTab] = useState<"transactions" | "positions">(
    "transactions"
  );

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="bg-zinc-950 font-sans h-full overflow-auto">
      <div className="p-4 flex flex-col gap-4 max-w-7xl mx-auto">
        {/* Vault Header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                <span className="font-bold text-lg">BTC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {mockVaultData.name}
                </h1>
                <p className="text-zinc-400 text-sm font-mono">
                  {mockVaultData.address.slice(0, 10)}...
                  {mockVaultData.address.slice(-8)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-full">
                Active
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full">
                Verified
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Total Value Locked</p>
              <p className="text-white text-xl font-bold mt-1">
                {formatCurrency(mockVaultData.tvl)}
              </p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">APY</p>
              <p className="text-emerald-400 text-xl font-bold mt-1">
                {mockVaultData.apy}%
              </p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Depositors</p>
              <p className="text-white text-xl font-bold mt-1">
                {mockVaultData.depositors.toLocaleString()}
              </p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Capacity Used</p>
              <div className="mt-1">
                <p className="text-white text-xl font-bold">
                  {((mockVaultData.tvl / mockVaultData.capacity) * 100).toFixed(
                    1
                  )}
                  %
                </p>
                <div className="w-full bg-zinc-700 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full"
                    style={{
                      width: `${
                        (mockVaultData.tvl / mockVaultData.capacity) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Performance</h2>
              <div className="flex gap-2">
                {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((period) => (
                  <button
                    key={period}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      period === "1Y"
                        ? "bg-zinc-700 text-white"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Performance Stats */}
            <div className="flex gap-6 mb-4">
              <div>
                <p className="text-zinc-400 text-xs">24h</p>
                <p
                  className={`font-medium ${
                    mockVaultData.dailyChange >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {mockVaultData.dailyChange >= 0 ? "+" : ""}
                  {mockVaultData.dailyChange}%
                </p>
              </div>
              <div>
                <p className="text-zinc-400 text-xs">7d</p>
                <p
                  className={`font-medium ${
                    mockVaultData.weeklyChange >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {mockVaultData.weeklyChange >= 0 ? "+" : ""}
                  {mockVaultData.weeklyChange}%
                </p>
              </div>
              <div>
                <p className="text-zinc-400 text-xs">30d</p>
                <p
                  className={`font-medium ${
                    mockVaultData.monthlyChange >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {mockVaultData.monthlyChange >= 0 ? "+" : ""}
                  {mockVaultData.monthlyChange}%
                </p>
              </div>
            </div>

            {/* Simple Chart Visualization */}
            <div className="h-64 flex items-end gap-1">
              {mockPerformanceData.map((point, index) => (
                <div
                  key={point.date}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-purple-500 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                    style={{ height: `${(point.value / 200) * 100}%` }}
                  />
                  <span className="text-zinc-500 text-xs">{point.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deposit/Withdraw Panel */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab("deposit")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "deposit"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                Deposit
              </button>
              <button
                onClick={() => setActiveTab("withdraw")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === "withdraw"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                Withdraw
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Amount (USDM)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm font-medium hover:text-blue-300">
                    MAX
                  </button>
                </div>
              </div>

              <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Your Balance</span>
                  <span className="text-white">10,000.00 USDM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Your Vault Shares</span>
                  <span className="text-white">0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Min. Deposit</span>
                  <span className="text-white">
                    {formatCurrency(mockVaultData.minDeposit)}
                  </span>
                </div>
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all">
                {activeTab === "deposit" ? "Deposit" : "Withdraw"}
              </button>

              <p className="text-zinc-500 text-xs text-center">
                Lock Period: {mockVaultData.lockPeriod}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">History</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setHistoryTab("transactions")}
                className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                  historyTab === "transactions"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setHistoryTab("positions")}
                className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                  historyTab === "positions"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                Positions
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-zinc-400 text-sm border-b border-zinc-800">
                  <th className="text-left py-3 font-medium">Type</th>
                  <th className="text-right py-3 font-medium">Amount</th>
                  <th className="text-right py-3 font-medium">Address</th>
                  <th className="text-right py-3 font-medium">Time</th>
                  <th className="text-right py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map((tx, index) => (
                  <tr
                    key={index}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
                  >
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          tx.type === "Deposit"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="text-right text-white font-mono">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="text-right text-zinc-400 font-mono text-sm">
                      {tx.address}
                    </td>
                    <td className="text-right text-zinc-400 text-sm">
                      {tx.time}
                    </td>
                    <td className="text-right">
                      <span className="text-emerald-400 text-sm">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
