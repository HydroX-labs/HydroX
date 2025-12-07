"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// HydroX Logo Component - matching landing page
const HydroXLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="32" height="32" rx="8" fill="#0a0a0a" />
    <path
      d="M16 6C16 6 10 12 10 18C10 21.3137 12.6863 24 16 24C19.3137 24 22 21.3137 22 18C22 12 16 6 16 6Z"
      fill="#00FFE0"
      style={{ filter: "drop-shadow(0 0 8px rgba(0,255,224,0.6))" }}
    />
    <path
      d="M16 10C16 10 13 14 13 17.5C13 19.433 14.567 21 16.5 21C18.433 21 20 19.433 20 17.5C20 14 16 10 16 10Z"
      fill="#0a0a0a"
      fillOpacity="0.5"
    />
  </svg>
);

// Wallet Icon
const WalletIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
  </svg>
);

declare global {
  interface Window {
    cardano?: {
      lace?: {
        enable: () => Promise<CardanoAPI>;
        isEnabled: () => Promise<boolean>;
        apiVersion: string;
        name: string;
        icon: string;
      };
    };
  }
}

interface CardanoAPI {
  getNetworkId: () => Promise<number>;
  getUsedAddresses: () => Promise<string[]>;
  getUnusedAddresses: () => Promise<string[]>;
  getChangeAddress: () => Promise<string>;
  getRewardAddresses: () => Promise<string[]>;
  getBalance: () => Promise<string>;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLaceAvailable, setIsLaceAvailable] = useState(false);
  const pathname = usePathname();

  const isPerpsActive = pathname.startsWith("/perp/");
  const isVaultsActive = pathname.startsWith("/vaults");

  // Check if Lace wallet is available
  useEffect(() => {
    const checkLace = () => {
      if (typeof window !== "undefined" && window.cardano?.lace) {
        setIsLaceAvailable(true);
      }
    };
    
    // Check immediately and after a delay (wallet extensions load async)
    checkLace();
    const timeout = setTimeout(checkLace, 1000);
    return () => clearTimeout(timeout);
  }, []);

  // Format address for display
  const formatAddress = (address: string) => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  // Connect to Lace Wallet
  const connectWallet = async () => {
    if (!window.cardano?.lace) {
      window.open("https://www.lace.io/", "_blank");
      return;
    }

    setIsConnecting(true);
    try {
      const api = await window.cardano.lace.enable();
      const addresses = await api.getUsedAddresses();
      
      if (addresses.length > 0) {
        // Convert hex to bech32 address display (simplified)
        setWalletAddress(addresses[0]);
      } else {
        const unusedAddresses = await api.getUnusedAddresses();
        if (unusedAddresses.length > 0) {
          setWalletAddress(unusedAddresses[0]);
        }
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletAddress(null);
  };

  return (
    <header className="bg-[#0a0a0a] border-b border-[#1a1a1a] text-white px-6 py-3 shrink-0 z-50">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center space-x-8">
          {/* Logo with HydroX theme */}
          <Link href="/" className="flex items-center space-x-2 group">
            <HydroXLogo className="h-8 w-8" />
            <h1 className="text-xl font-bold text-[#00FFE0] drop-shadow-[0_0_10px_rgba(0,255,224,0.5)] group-hover:drop-shadow-[0_0_15px_rgba(0,255,224,0.7)] transition-all">
              HydroX
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            <Link
              href="/perp/BTC_USDM"
              className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                isPerpsActive
                  ? "text-[#00FFE0] bg-[#00FFE0]/10 border border-[#00FFE0]/30"
                  : "text-zinc-400 hover:text-[#00FFE0] hover:bg-[#00FFE0]/5"
              }`}
            >
              Perps
            </Link>
            <Link
              href="/vaults"
              className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                isVaultsActive
                  ? "text-[#00FFE0] bg-[#00FFE0]/10 border border-[#00FFE0]/30"
                  : "text-zinc-400 hover:text-[#00FFE0] hover:bg-[#00FFE0]/5"
              }`}
            >
              Vaults
            </Link>
          </nav>
        </div>

        {/* Right side - Wallet Connection */}
        <div className="hidden md:flex items-center">
          {walletAddress ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-[#00FFE0]/10 border border-[#00FFE0]/30 rounded-lg">
                <div className="w-2 h-2 bg-[#00FFE0] rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,224,0.6)]" />
                <span className="text-sm font-mono text-[#00FFE0]">
                  {formatAddress(walletAddress)}
                </span>
              </div>
              <button
                onClick={disconnectWallet}
                className="px-3 py-2 text-sm font-medium text-zinc-400 hover:text-red-400 transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#00FFE0] hover:bg-[#00FFE0]/90 text-black rounded-lg transition-all hover:shadow-[0_0_20px_rgba(0,255,224,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <WalletIcon className="h-4 w-4" />
                  <span>{isLaceAvailable ? "Connect Wallet" : "Install Lace"}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-[#00FFE0]/10 transition-colors text-[#00FFE0]"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-[#1a1a1a]">
          <nav className="flex flex-col space-y-1">
            <Link
              href="/perp/BTC_USDM"
              className={`px-4 py-2 rounded-lg ${
                isPerpsActive
                  ? "text-[#00FFE0] bg-[#00FFE0]/10"
                  : "text-zinc-400 hover:text-[#00FFE0] hover:bg-[#00FFE0]/5"
              }`}
            >
              Perps
            </Link>
            <Link
              href="/vaults"
              className={`px-4 py-2 rounded-lg ${
                isVaultsActive
                  ? "text-[#00FFE0] bg-[#00FFE0]/10"
                  : "text-zinc-400 hover:text-[#00FFE0] hover:bg-[#00FFE0]/5"
              }`}
            >
              Vaults
            </Link>
          </nav>
          <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
            {walletAddress ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-[#00FFE0]/10 border border-[#00FFE0]/30 rounded-lg">
                  <div className="w-2 h-2 bg-[#00FFE0] rounded-full animate-pulse" />
                  <span className="text-sm font-mono text-[#00FFE0]">
                    {formatAddress(walletAddress)}
                  </span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="w-full py-2 text-sm font-medium text-zinc-400 hover:text-red-400"
                >
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold bg-[#00FFE0] hover:bg-[#00FFE0]/90 text-black rounded-lg disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <WalletIcon className="h-4 w-4" />
                    <span>{isLaceAvailable ? "Connect Wallet" : "Install Lace"}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
