"use client";

import { useState } from "react";

// Mock data for the vault
const mockVaultData = {
  name: "HydroX Liquidity Provider",
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
    "Automated momentum trading strategy utilizing perpetual futures on BTC-USDM pair with dynamic risk management.",
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
    <div className="bg-[#0a0a0a] font-sans h-full overflow-auto">
      <div className="p-4 flex flex-col gap-4 max-w-7xl mx-auto">
        {/* Vault Header */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#00FFE0]/20 border border-[#00FFE0]/30 flex items-center justify-center">
                <span className="font-bold text-lg text-[#00FFE0]">BTC</span>
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
              <span className="px-3 py-1 bg-[#00FFE0]/10 text-[#00FFE0] text-sm font-medium rounded-full border border-[#00FFE0]/30">
                Active
              </span>
              <span className="px-3 py-1 bg-[#00FFE0]/5 text-[#00FFE0]/70 text-sm font-medium rounded-full border border-[#00FFE0]/20">
                Verified
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Total Value Locked</p>
              <p className="text-white text-xl font-bold mt-1">
                {formatCurrency(mockVaultData.tvl)}
              </p>
            </div>
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
              <p className="text-zinc-400 text-sm">APY</p>
              <p className="text-[#00FFE0] text-xl font-bold mt-1 drop-shadow-[0_0_8px_rgba(0,255,224,0.4)]">
                {mockVaultData.apy}%
              </p>
            </div>
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Depositors</p>
              <p className="text-white text-xl font-bold mt-1">
                {mockVaultData.depositors.toLocaleString()}
              </p>
            </div>
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Capacity Used</p>
              <div className="mt-1">
                <p className="text-white text-xl font-bold">
                  {((mockVaultData.tvl / mockVaultData.capacity) * 100).toFixed(
                    1
                  )}
                  %
                </p>
                <div className="w-full bg-[#1f1f1f] rounded-full h-1.5 mt-2">
                  <div
                    className="bg-gradient-to-r from-[#00FFE0] to-[#00D4AA] h-1.5 rounded-full shadow-[0_0_10px_rgba(0,255,224,0.4)]"
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
          <div className="lg:col-span-2 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold">Performance</h2>
              <div className="flex gap-2">
                {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((period) => (
                  <button
                    key={period}
                    className={`px-3 py-1 text-sm rounded-lg transition-all ${
                      period === "1Y"
                        ? "bg-[#00FFE0]/10 text-[#00FFE0] border border-[#00FFE0]/30"
                        : "text-zinc-400 hover:text-[#00FFE0] hover:bg-[#00FFE0]/5"
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
                      ? "text-[#00FFE0]"
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
                      ? "text-[#00FFE0]"
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
                      ? "text-[#00FFE0]"
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
                    className="w-full bg-gradient-to-t from-[#00FFE0] to-[#00D4AA] rounded-t opacity-70 hover:opacity-100 transition-opacity shadow-[0_0_15px_rgba(0,255,224,0.3)]"
                    style={{ height: `${(point.value / 200) * 100}%` }}
                  />
                  <span className="text-zinc-500 text-xs">{point.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deposit/Withdraw Panel */}
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-6">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab("deposit")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === "deposit"
                    ? "bg-[#00FFE0] text-black shadow-[0_0_20px_rgba(0,255,224,0.4)]"
                    : "bg-[#141414] border border-[#1f1f1f] text-zinc-400 hover:text-white hover:border-[#00FFE0]/30"
                }`}
              >
                Deposit
              </button>
              <button
                onClick={() => setActiveTab("withdraw")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === "withdraw"
                    ? "bg-[#00FFE0] text-black shadow-[0_0_20px_rgba(0,255,224,0.4)]"
                    : "bg-[#141414] border border-[#1f1f1f] text-zinc-400 hover:text-white hover:border-[#00FFE0]/30"
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
                    className="w-full bg-[#141414] border border-[#1f1f1f] rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#00FFE0]/50 focus:ring-1 focus:ring-[#00FFE0]/20 transition-all"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00FFE0] text-sm font-medium hover:text-[#00FFE0]/80">
                    MAX
                  </button>
                </div>
              </div>

              <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4 space-y-2">
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

              <button className="w-full py-3 bg-[#00FFE0] hover:bg-[#00FFE0]/90 text-black font-semibold rounded-lg transition-all hover:shadow-[0_0_20px_rgba(0,255,224,0.4)]">
                {activeTab === "deposit" ? "Deposit" : "Withdraw"}
              </button>

              <p className="text-zinc-500 text-xs text-center">
                Lock Period: {mockVaultData.lockPeriod}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">History</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setHistoryTab("transactions")}
                className={`px-4 py-1.5 text-sm rounded-lg transition-all ${
                  historyTab === "transactions"
                    ? "bg-[#00FFE0]/10 text-[#00FFE0] border border-[#00FFE0]/30"
                    : "text-zinc-400 hover:text-[#00FFE0] hover:bg-[#00FFE0]/5"
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setHistoryTab("positions")}
                className={`px-4 py-1.5 text-sm rounded-lg transition-all ${
                  historyTab === "positions"
                    ? "bg-[#00FFE0]/10 text-[#00FFE0] border border-[#00FFE0]/30"
                    : "text-zinc-400 hover:text-[#00FFE0] hover:bg-[#00FFE0]/5"
                }`}
              >
                Positions
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-zinc-400 text-sm border-b border-[#1f1f1f]">
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
                    className="border-b border-[#1f1f1f]/50 hover:bg-[#00FFE0]/5 transition-colors"
                  >
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded border ${
                          tx.type === "Deposit"
                            ? "bg-[#00FFE0]/10 text-[#00FFE0] border-[#00FFE0]/30"
                            : "bg-red-500/10 text-red-400 border-red-500/30"
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
                      <span className="text-[#00FFE0] text-sm">
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
