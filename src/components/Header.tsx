"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isPerpsActive = pathname.startsWith("/perp/");
  const isSpotActive = pathname.startsWith("/spot/");
  const isVaultsActive = pathname.startsWith("/vaults");

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 text-white px-6 py-3 shrink-0 z-50">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center space-x-8">
          {/* Logo with gradient */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="font-bold text-sm">BX</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              HydroX
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            <Link
              href="/perp/BTC_USDM"
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                isPerpsActive
                  ? "text-white bg-zinc-800 hover:bg-zinc-700"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              Perps
            </Link>
            <Link
              href="/spot/BTC_USDM"
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                isSpotActive
                  ? "text-white bg-zinc-800 hover:bg-zinc-700"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              Spot
            </Link>
            <Link
              href="/vaults"
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                isVaultsActive
                  ? "text-white bg-zinc-800 hover:bg-zinc-700"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              Vaults
            </Link>
            <Link
              href="#"
              className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-sm font-medium"
            >
              Portfolio
            </Link>
            <Link
              href="#"
              className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-sm font-medium"
            >
              Affiliate
            </Link>
          </nav>
        </div>

        {/* Right side buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <button className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors">
            Sign In
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all">
            Get Started
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
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
        <div className="md:hidden mt-4 pt-4 border-t border-zinc-800">
          <nav className="flex flex-col space-y-1">
            <Link
              href="/perp/BTC_USDM"
              className={`px-4 py-2 rounded-lg ${
                isPerpsActive
                  ? "text-white bg-zinc-800"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              Perps
            </Link>
            <Link
              href="/spot/BTC_USDM"
              className={`px-4 py-2 rounded-lg ${
                isSpotActive
                  ? "text-white bg-zinc-800"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              Spot
            </Link>
            <Link
              href="/vaults"
              className={`px-4 py-2 rounded-lg ${
                isVaultsActive
                  ? "text-white bg-zinc-800"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              Vaults
            </Link>
            <Link
              href="#"
              className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Portfolio
            </Link>
            <Link
              href="#"
              className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Affiliate
            </Link>
          </nav>
          <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-zinc-800">
            <button className="w-full py-2 text-sm font-medium text-zinc-300 hover:text-white">
              Sign In
            </button>
            <button className="w-full py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
