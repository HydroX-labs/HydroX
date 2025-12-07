"use client";

import React, { useState } from "react";
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

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isTradeActive = pathname.startsWith("/perp/") || pathname.startsWith("/spot/");
  const isVaultsActive = pathname.startsWith("/vaults");

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
                isTradeActive
                  ? "text-[#00FFE0] bg-[#00FFE0]/10 border border-[#00FFE0]/30"
                  : "text-zinc-400 hover:text-[#00FFE0] hover:bg-[#00FFE0]/5"
              }`}
            >
              Trade
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

        {/* Right side buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <button className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-[#00FFE0] transition-colors">
            Sign In
          </button>
          <button className="px-4 py-2 text-sm font-semibold bg-[#00FFE0] hover:bg-[#00FFE0]/90 text-black rounded-lg transition-all hover:shadow-[0_0_20px_rgba(0,255,224,0.4)]">
            Get Started
          </button>
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
                isTradeActive
                  ? "text-[#00FFE0] bg-[#00FFE0]/10"
                  : "text-zinc-400 hover:text-[#00FFE0] hover:bg-[#00FFE0]/5"
              }`}
            >
              Trade
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
          <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-[#1a1a1a]">
            <button className="w-full py-2 text-sm font-medium text-zinc-300 hover:text-[#00FFE0]">
              Sign In
            </button>
            <button className="w-full py-2 text-sm font-semibold bg-[#00FFE0] hover:bg-[#00FFE0]/90 text-black rounded-lg">
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
