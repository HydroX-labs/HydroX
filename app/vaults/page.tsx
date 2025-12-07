"use client";

import { useState, useEffect } from "react";
import { vaultApi, Vault, VaultPerformance, VaultTransaction, UserVaultInfo } from "@/lib/api";

export default function VaultsPage() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [performance, setPerformance] = useState<VaultPerformance[]>([]);
  const [transactions, setTransactions] = useState<VaultTransaction[]>([]);
  const [userInfo, setUserInfo] = useState<UserVaultInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [historyTab, setHistoryTab] = useState<"transactions" | "positions">(
    "transactions"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load vaults
  useEffect(() => {
    const loadVaults = async () => {
      try {
        const data = await vaultApi.getVaults();
        setVaults(data);
        if (data.length > 0) {
          setSelectedVault(data[0]);
        }
      } catch (err) {
        console.error("Failed to load vaults:", err);
      } finally {
        setLoading(false);
      }
    };

    loadVaults();
  }, []);

  // Load vault details when selected
  useEffect(() => {
    if (!selectedVault) return;

    const loadDetails = async () => {
      try {
        const [perfData, txData, userInfoData] = await Promise.all([
          vaultApi.getPerformance(selectedVault.id),
          vaultApi.getTransactions(selectedVault.id),
          vaultApi.getUserInfo(selectedVault.id).catch(() => null),
        ]);
        setPerformance(perfData);
        setTransactions(txData);
        setUserInfo(userInfoData);
      } catch (err) {
        console.error("Failed to load vault details:", err);
      }
    };

    loadDetails();
  }, [selectedVault]);

  const handleDeposit = async () => {
    if (!selectedVault || !amount) return;
    setIsSubmitting(true);
    try {
      await vaultApi.deposit(selectedVault.id, parseFloat(amount));
      setAmount("");
      // Refresh data
      const [vaultData, txData] = await Promise.all([
        vaultApi.getVault(selectedVault.id),
        vaultApi.getTransactions(selectedVault.id),
      ]);
      setSelectedVault(vaultData);
      setTransactions(txData);
    } catch (err) {
      console.error("Failed to deposit:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedVault || !amount) return;
    setIsSubmitting(true);
    try {
      await vaultApi.withdraw(selectedVault.id, parseFloat(amount));
      setAmount("");
      // Refresh data
      const [vaultData, txData] = await Promise.all([
        vaultApi.getVault(selectedVault.id),
        vaultApi.getTransactions(selectedVault.id),
      ]);
      setSelectedVault(vaultData);
      setTransactions(txData);
    } catch (err) {
      console.error("Failed to withdraw:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (num: number | undefined) => {
    if (num === undefined || num === 0) return "$--";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const formatPercent = (num: number | undefined) => {
    if (num === undefined) return "--%";
    const sign = num >= 0 ? "+" : "";
    return `${sign}${num.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="bg-[#0a0a0a] h-full flex items-center justify-center">
        <div className="text-[#00FFE0] animate-pulse">Loading vaults...</div>
      </div>
    );
  }

  const isEmpty = !selectedVault;
  const capacityUsed = selectedVault
    ? ((selectedVault.tvl / selectedVault.capacity) * 100).toFixed(1)
    : 0;

  return (
    <div className="bg-[#0a0a0a] font-sans h-full overflow-auto">
      <div className="p-4 flex flex-col gap-4 max-w-7xl mx-auto">
        {/* Vault Selector */}
        {vaults.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {vaults.map((vault) => (
              <button
                key={vault.id}
                onClick={() => setSelectedVault(vault)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedVault?.id === vault.id
                    ? "bg-[#00FFE0] text-black"
                    : "bg-[#141414] text-zinc-400 border border-[#1f1f1f] hover:border-[#00FFE0]/30"
                }`}
              >
                {vault.name}
              </button>
            ))}
          </div>
        )}

        {/* Vault Header */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#00FFE0]/20 border border-[#00FFE0]/30 flex items-center justify-center">
                <span className="font-bold text-lg text-[#00FFE0]">
                  {selectedVault?.name?.charAt(0) || "--"}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {selectedVault?.name || "Vault Name"}
                </h1>
                <p className="text-zinc-500 text-sm font-mono">
                  {selectedVault?.address
                    ? `${selectedVault.address.slice(0, 10)}...${selectedVault.address.slice(-8)}`
                    : "No address"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full border ${
                  selectedVault?.status === "active"
                    ? "bg-[#00FFE0]/10 text-[#00FFE0] border-[#00FFE0]/30"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}
              >
                {selectedVault?.status || "Inactive"}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Total Value Locked</p>
              <p
                className={`text-xl font-bold mt-1 ${
                  selectedVault?.tvl ? "text-[#00FFE0]" : "text-zinc-500"
                }`}
              >
                {formatCurrency(selectedVault?.tvl)}
              </p>
            </div>
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
              <p className="text-zinc-400 text-sm">APY</p>
              <p
                className={`text-xl font-bold mt-1 ${
                  selectedVault?.apy ? "text-[#00FFE0]" : "text-zinc-500"
                }`}
              >
                {selectedVault?.apy ? `${selectedVault.apy}%` : "--%"}
              </p>
            </div>
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Depositors</p>
              <p
                className={`text-xl font-bold mt-1 ${
                  selectedVault?.depositors ? "text-white" : "text-zinc-500"
                }`}
              >
                {selectedVault?.depositors || "--"}
              </p>
            </div>
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Capacity Used</p>
              <div className="mt-1">
                <p
                  className={`text-xl font-bold ${
                    !isEmpty ? "text-white" : "text-zinc-500"
                  }`}
                >
                  {isEmpty ? "--%": `${capacityUsed}%`}
                </p>
                <div className="w-full bg-[#1f1f1f] rounded-full h-1.5 mt-2">
                  <div
                    className="bg-[#00FFE0] h-1.5 rounded-full transition-all"
                    style={{ width: isEmpty ? "0%" : `${capacityUsed}%` }}
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
                <p
                  className={`font-medium ${
                    (selectedVault?.daily_change ?? 0) >= 0
                      ? "text-[#00FFE0]"
                      : "text-red-500"
                  }`}
                >
                  {formatPercent(selectedVault?.daily_change)}
                </p>
              </div>
              <div>
                <p className="text-zinc-400 text-xs">7d</p>
                <p
                  className={`font-medium ${
                    (selectedVault?.weekly_change ?? 0) >= 0
                      ? "text-[#00FFE0]"
                      : "text-red-500"
                  }`}
                >
                  {formatPercent(selectedVault?.weekly_change)}
                </p>
              </div>
              <div>
                <p className="text-zinc-400 text-xs">30d</p>
                <p
                  className={`font-medium ${
                    (selectedVault?.monthly_change ?? 0) >= 0
                      ? "text-[#00FFE0]"
                      : "text-red-500"
                  }`}
                >
                  {formatPercent(selectedVault?.monthly_change)}
                </p>
              </div>
            </div>

            {/* Chart or Empty State */}
            {performance.length > 0 ? (
              <div className="h-64 flex items-center justify-center border border-[#1f1f1f] rounded-lg bg-[#0a0a0a]">
                {/* TODO: Implement chart with lightweight-charts */}
                <div className="text-zinc-500 text-sm">Performance chart</div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center border border-[#1f1f1f] rounded-lg bg-[#0a0a0a]">
                <div className="text-center text-zinc-600">
                  <svg
                    className="w-12 h-12 mx-auto mb-2 opacity-30"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                  <p className="text-sm">No performance data</p>
                </div>
              </div>
            )}
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
                  <button
                    onClick={() =>
                      setAmount(userInfo?.balance?.toString() || "")
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00FFE0] text-sm font-medium hover:text-[#00FFE0]/80"
                  >
                    MAX
                  </button>
                </div>
              </div>

              <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Your Balance</span>
                  <span
                    className={userInfo?.balance ? "text-white" : "text-zinc-500"}
                  >
                    {userInfo?.balance?.toFixed(2) || "--"} USDM
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Your Vault Shares</span>
                  <span
                    className={userInfo?.shares ? "text-white" : "text-zinc-500"}
                  >
                    {userInfo?.shares?.toFixed(4) || "--"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Min. Deposit</span>
                  <span className="text-zinc-500">
                    {formatCurrency(selectedVault?.min_deposit)}
                  </span>
                </div>
              </div>

              <button
                onClick={activeTab === "deposit" ? handleDeposit : handleWithdraw}
                disabled={isSubmitting || !amount || isEmpty}
                className={`w-full py-3 font-semibold rounded-lg transition-all ${
                  isSubmitting || !amount || isEmpty
                    ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                    : "bg-[#00FFE0] text-black hover:shadow-[0_0_20px_rgba(0,255,224,0.4)]"
                }`}
              >
                {isSubmitting
                  ? "Processing..."
                  : isEmpty
                  ? "No Vault Selected"
                  : activeTab === "deposit"
                  ? "Deposit"
                  : "Withdraw"}
              </button>

              <p className="text-zinc-500 text-xs text-center">
                Lock Period:{" "}
                {selectedVault?.lock_period_days
                  ? `${selectedVault.lock_period_days} days`
                  : "--"}
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
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-[#1f1f1f]/50 hover:bg-[#00FFE0]/5 transition-colors"
                    >
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded border ${
                            tx.type === "DEPOSIT"
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
                        {tx.address.slice(0, 6)}...{tx.address.slice(-4)}
                      </td>
                      <td className="text-right text-zinc-400 text-sm">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                      <td className="text-right">
                        <span
                          className={`text-sm ${
                            tx.status === "COMPLETED"
                              ? "text-[#00FFE0]"
                              : tx.status === "PENDING"
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
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
              <svg
                className="w-10 h-10 mb-2 opacity-30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-sm">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
