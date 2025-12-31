"use client";

import { useState, useEffect } from "react";
import { vaultApi, vaultScriptApi, accountApi, Vault, VaultPerformance, VaultTransaction, UserVaultInfo, VaultScriptInfo } from "@/lib/api";
import { useWallet } from "@/contexts/WalletContext";

// Local transaction history item
interface LocalTransaction {
  id: string;
  type: "DEPOSIT" | "WITHDRAW";
  amount: number;
  txHash: string;
  timestamp: number;
  status: "COMPLETED" | "PENDING" | "FAILED";
}

export default function VaultsPage() {
  const { walletAddress, depositToVault, withdrawFromVault } = useWallet();
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [performance, setPerformance] = useState<VaultPerformance[]>([]);
  const [transactions, setTransactions] = useState<VaultTransaction[]>([]);
  const [localTransactions, setLocalTransactions] = useState<LocalTransaction[]>([]);
  const [userInfo, setUserInfo] = useState<UserVaultInfo | null>(null);
  const [vaultScriptInfo, setVaultScriptInfo] = useState<VaultScriptInfo | null>(null);
  const [userUsdmBalance, setUserUsdmBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [txStatus, setTxStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load local transactions from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && walletAddress) {
      const stored = localStorage.getItem(`vault_tx_${walletAddress}`);
      if (stored) {
        try {
          setLocalTransactions(JSON.parse(stored));
        } catch {
          setLocalTransactions([]);
        }
      }
    }
  }, [walletAddress]);

  // Save local transactions to localStorage
  const saveLocalTransaction = (tx: LocalTransaction) => {
    const updated = [tx, ...localTransactions].slice(0, 50); // Keep last 50
    setLocalTransactions(updated);
    if (typeof window !== 'undefined' && walletAddress) {
      localStorage.setItem(`vault_tx_${walletAddress}`, JSON.stringify(updated));
    }
  };

  // Load vaults and on-chain vault info
  useEffect(() => {
    const loadVaults = async () => {
      try {
        // Load on-chain vault script info (USDM deposited in script)
        const scriptInfo = await vaultScriptApi.getVaultInfo().catch((err) => {
          console.error("Failed to load vault script info:", err);
          return null;
        });
        setVaultScriptInfo(scriptInfo);

        // Load vault list from API (if available)
        const data = await vaultApi.getVaults().catch(() => []);
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

  // Load user's USDM balance when wallet is connected
  useEffect(() => {
    const loadUserBalance = async () => {
      if (!walletAddress) {
        setUserUsdmBalance(0);
        return;
      }
      try {
        const balance = await accountApi.getUSDMBalance(walletAddress);
        setUserUsdmBalance(balance);
        console.log("User USDM balance:", balance);
      } catch (err) {
        console.error("Failed to load user USDM balance:", err);
        setUserUsdmBalance(0);
      }
    };

    loadUserBalance();
  }, [walletAddress]);

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

  // Refresh vault info and user balance from chain
  const refreshVaultInfo = async () => {
    try {
      const scriptInfo = await vaultScriptApi.getVaultInfo().catch(() => null);
      setVaultScriptInfo(scriptInfo);

      // Also refresh user's USDM balance
      if (walletAddress) {
        const balance = await accountApi.getUSDMBalance(walletAddress);
        setUserUsdmBalance(balance);
      }
    } catch (err) {
      console.error("Failed to refresh vault info:", err);
    }
  };

  const handleDeposit = async () => {
    if (!amount || !walletAddress) return;
    setIsSubmitting(true);
    setTxStatus(null);
    try {
      const depositAmount = parseFloat(amount);
      if (isNaN(depositAmount) || depositAmount <= 0) {
        throw new Error("Invalid amount");
      }

      console.log("Depositing to vault:", depositAmount, "USDM");
      const result = await depositToVault(depositAmount);

      // Save to local history
      saveLocalTransaction({
        id: result.txHash,
        type: "DEPOSIT",
        amount: depositAmount,
        txHash: result.txHash,
        timestamp: Date.now(),
        status: "COMPLETED",
      });

      setTxStatus({
        type: 'success',
        message: `Deposited ${depositAmount} USDM. TX: ${result.txHash.slice(0, 8)}...`,
      });
      setAmount("");

      // Refresh vault info after a short delay for chain confirmation
      setTimeout(refreshVaultInfo, 3000);
    } catch (err) {
      console.error("Failed to deposit:", err);
      setTxStatus({
        type: 'error',
        message: err instanceof Error ? err.message : "Failed to deposit",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || !walletAddress) return;
    setIsSubmitting(true);
    setTxStatus(null);
    try {
      const sharesToBurn = parseFloat(amount);
      if (isNaN(sharesToBurn) || sharesToBurn <= 0) {
        throw new Error("Invalid shares amount");
      }

      console.log("Withdrawing from vault:", sharesToBurn, "shares");
      const result = await withdrawFromVault(sharesToBurn);

      // Save to local history
      saveLocalTransaction({
        id: result.txHash,
        type: "WITHDRAW",
        amount: result.amount,
        txHash: result.txHash,
        timestamp: Date.now(),
        status: "COMPLETED",
      });

      setTxStatus({
        type: 'success',
        message: `Withdrew ${result.amount} USDM. TX: ${result.txHash.slice(0, 8)}...`,
      });
      setAmount("");

      // Refresh vault info after a short delay for chain confirmation
      setTimeout(refreshVaultInfo, 3000);
    } catch (err) {
      console.error("Failed to withdraw:", err);
      setTxStatus({
        type: 'error',
        message: err instanceof Error ? err.message : "Failed to withdraw",
      });
    } finally {
      setIsSubmitting(false);
    }
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

  const formatUSDM = (num: number | undefined) => {
    if (num === undefined || num === 0) return "0";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Combine local and API transactions for display
  interface DisplayTransaction {
    id: string;
    type: string;
    amount: number;
    address: string;
    status: string;
    created_at: string;
    txHash?: string;
  }

  const allTransactions: DisplayTransaction[] = [
    ...localTransactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      address: walletAddress || "",
      status: tx.status,
      created_at: new Date(tx.timestamp).toISOString(),
      txHash: tx.txHash,
    })),
    ...transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      address: tx.address,
      status: tx.status,
      created_at: tx.created_at,
      txHash: undefined,
    })),
  ];

  return (
    <div className="bg-[#0a0a0a] font-sans h-full overflow-auto">
      <div className="p-4 flex flex-col gap-4 max-w-7xl mx-auto">
        {/* On-Chain Vault Stats */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#00FFE0]/20 border border-[#00FFE0]/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#00FFE0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Vault Liquidity</h2>
              <p className="text-zinc-500 text-sm">On-chain USDM deposits</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Total USDM Deposited</p>
              <p className={`text-2xl font-bold mt-1 ${vaultScriptInfo?.total_usdm ? "text-[#00FFE0]" : "text-zinc-500"}`}>
                {formatUSDM(vaultScriptInfo?.total_usdm)} <span className="text-sm font-normal text-zinc-400">USDM</span>
              </p>
            </div>
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Total ADA in Vault</p>
              <p className={`text-2xl font-bold mt-1 ${vaultScriptInfo?.total_ada ? "text-white" : "text-zinc-500"}`}>
                {vaultScriptInfo?.total_ada?.toFixed(2) ?? "0.00"} <span className="text-sm font-normal text-zinc-400">ADA</span>
              </p>
            </div>
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
              <p className="text-zinc-400 text-sm">APY</p>
              <p className="text-2xl font-bold mt-1 text-zinc-500">
                --<span className="text-sm font-normal text-zinc-400">%</span>
              </p>
            </div>
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Depositors</p>
              <p className="text-2xl font-bold mt-1 text-zinc-500">
                --
              </p>
            </div>
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Capacity Used</p>
              <p className="text-2xl font-bold mt-1 text-zinc-500">
                --<span className="text-sm font-normal text-zinc-400">%</span>
              </p>
            </div>
            <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Script Address</p>
              <p className="text-sm font-mono mt-1 text-zinc-300 truncate" title={vaultScriptInfo?.script_address}>
                {vaultScriptInfo?.script_address
                  ? `${vaultScriptInfo.script_address.slice(0, 12)}...${vaultScriptInfo.script_address.slice(-6)}`
                  : "Not configured"}
              </p>
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
                  {activeTab === "deposit" ? "Amount (USDM)" : "Shares to Burn"}
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
                      setAmount(userUsdmBalance?.toString() || "")
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
                    className={userUsdmBalance > 0 ? "text-white" : "text-zinc-500"}
                  >
                    {userUsdmBalance > 0 ? formatUSDM(userUsdmBalance) : "--"} USDM
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
                  <span className="text-zinc-500">100 USDM</span>
                </div>
              </div>

              {/* TX Status Message */}
              {txStatus && (
                <div className={`p-3 rounded-lg text-sm ${
                  txStatus.type === 'success'
                    ? 'bg-[#00FFE0]/10 text-[#00FFE0] border border-[#00FFE0]/30'
                    : 'bg-red-500/10 text-red-400 border border-red-500/30'
                }`}>
                  {txStatus.message}
                </div>
              )}

              <button
                onClick={activeTab === "deposit" ? handleDeposit : handleWithdraw}
                disabled={isSubmitting || !amount || !walletAddress}
                className={`w-full py-3 font-semibold rounded-lg transition-all ${
                  isSubmitting || !amount || !walletAddress
                    ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                    : "bg-[#00FFE0] text-black hover:shadow-[0_0_20px_rgba(0,255,224,0.4)]"
                }`}
              >
                {isSubmitting
                  ? "Processing..."
                  : !walletAddress
                  ? "Connect Wallet"
                  : activeTab === "deposit"
                  ? `Deposit ${amount ? amount + " USDM" : ""}`
                  : `Withdraw ${amount ? amount + " Shares" : ""}`}
              </button>

              <p className="text-zinc-500 text-xs text-center">
                {activeTab === "withdraw"
                  ? "Enter shares to burn (not USDM amount)"
                  : `Min. Deposit: 100 USDM`}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Transaction History</h2>
            {localTransactions.length > 0 && (
              <span className="text-zinc-500 text-sm">{localTransactions.length} transactions</span>
            )}
          </div>

          {allTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-zinc-400 text-sm border-b border-[#1f1f1f]">
                    <th className="text-left py-3 font-medium">Type</th>
                    <th className="text-right py-3 font-medium">Amount</th>
                    <th className="text-right py-3 font-medium">TX Hash</th>
                    <th className="text-right py-3 font-medium">Time</th>
                    <th className="text-right py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allTransactions.map((tx) => (
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
                        {formatUSDM(tx.amount)} USDM
                      </td>
                      <td className="text-right text-zinc-400 font-mono text-sm">
                        {tx.txHash ? (
                          <a
                            href={`https://preview.cardanoscan.io/transaction/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#00FFE0] transition-colors"
                          >
                            {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                          </a>
                        ) : tx.address ? (
                          `${tx.address.slice(0, 6)}...${tx.address.slice(-4)}`
                        ) : (
                          "--"
                        )}
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
              <p className="text-xs text-zinc-600 mt-1">Deposit or withdraw to see history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
