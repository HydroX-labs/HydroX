"use client";

import { useState } from "react";

// TODO: API에서 Vault 데이터 로드
const vaultData = {
  name: "",
  address: "",
  tvl: 0,
  apy: 0,
  dailyChange: 0,
  weeklyChange: 0,
  monthlyChange: 0,
  depositors: 0,
  capacity: 0,
  lockPeriod: "",
  minDeposit: 0,
};

const performanceData: { date: string; value: number }[] = [];
const transactions: {
  type: string;
  amount: number;
  time: string;
  address: string;
  status: string;
}[] = [];

export default function VaultsPage() {
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [historyTab, setHistoryTab] = useState<"transactions" | "positions">(
    "transactions"
  );

  const formatCurrency = (num: number) => {
    if (num === 0) return "$--";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const isEmpty = !vaultData.name;

  return (
    <div className="bg-[#0a0a0a] font-sans h-full overflow-auto">
      <div className="p-4 flex flex-col gap-4 max-w-7xl mx-auto">
        {/* Vault Header */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#00FFE0]/20 border border-[#00FFE0]/30 flex items-center justify-center">
                <span className="font-bold text-lg text-[#00FFE0]">--</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {vaultData.name || "Vault Name"}
                </h1>
                <p className="text-zinc-500 text-sm font-mono">
                  {vaultData.address ? `${vaultData.address.slice(0, 10)}...${vaultData.address.slice(-8)}` : "No address"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-sm font-medium rounded-full border border-zinc-700">
                Inactive
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Total Value Locked</p>
              <p className="text-zinc-500 text-xl font-bold mt-1">
                {formatCurrency(vaultData.tvl)}
              </p>
            </div>
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
              <p className="text-zinc-400 text-sm">APY</p>
              <p className="text-zinc-500 text-xl font-bold mt-1">
                {vaultData.apy ? `${vaultData.apy}%` : "--%"}
              </p>
            </div>
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Depositors</p>
              <p className="text-zinc-500 text-xl font-bold mt-1">
                {vaultData.depositors || "--"}
              </p>
            </div>
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Capacity Used</p>
              <div className="mt-1">
                <p className="text-zinc-500 text-xl font-bold">--%</p>
                <div className="w-full bg-[#1f1f1f] rounded-full h-1.5 mt-2">
                  <div className="bg-zinc-600 h-1.5 rounded-full" style={{ width: "0%" }} />
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
                    className="px-3 py-1 text-sm rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a1a] transition-all"
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
                <p className="font-medium text-zinc-500">--%</p>
              </div>
              <div>
                <p className="text-zinc-400 text-xs">7d</p>
                <p className="font-medium text-zinc-500">--%</p>
              </div>
              <div>
                <p className="text-zinc-400 text-xs">30d</p>
                <p className="font-medium text-zinc-500">--%</p>
              </div>
            </div>

            {/* Empty Chart */}
            <div className="h-64 flex items-center justify-center border border-[#1f1f1f] rounded-lg bg-[#0a0a0a]">
              <div className="text-center text-zinc-600">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <p className="text-sm">No performance data</p>
              </div>
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
                  <span className="text-zinc-500">-- USDM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Your Vault Shares</span>
                  <span className="text-zinc-500">--</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Min. Deposit</span>
                  <span className="text-zinc-500">
                    {formatCurrency(vaultData.minDeposit)}
                  </span>
                </div>
              </div>

              <button className="w-full py-3 bg-zinc-700 text-zinc-400 font-semibold rounded-lg cursor-not-allowed">
                Connect Wallet
              </button>

              <p className="text-zinc-500 text-xs text-center">
                Lock Period: {vaultData.lockPeriod || "--"}
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

          {transactions.length > 0 ? (
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
                  {transactions.map((tx, index) => (
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
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <svg className="w-10 h-10 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
