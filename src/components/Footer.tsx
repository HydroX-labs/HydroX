"use client";

import React, { useState, useEffect } from 'react';

const Footer = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    // Simulate latency check
    const checkLatency = () => {
      const start = Date.now();
      fetch('/api/backpack/ticker?symbol=BTC_USDM_PERP', { method: 'HEAD' })
        .then(() => setLatency(Date.now() - start))
        .catch(() => setLatency(null));
    };

    checkLatency();
    const interval = setInterval(checkLatency, 10000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  const getLatencyColor = () => {
    if (!latency) return 'text-zinc-500';
    if (latency < 100) return 'text-green-500';
    if (latency < 300) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <footer className="w-full bg-zinc-900 border-t border-zinc-800 text-zinc-400 px-6 py-2 text-xs shrink-0">
      <div className="flex items-center justify-between w-full">
        {/* Left side - Links */}
        <div className="hidden md:flex items-center space-x-4">
          <a href="#" className="hover:text-white transition-colors">API Docs</a>
          <span className="text-zinc-700">|</span>
          <a href="#" className="hover:text-white transition-colors">Support</a>
          <span className="text-zinc-700">|</span>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
        </div>

        {/* Right side - Status */}
        <div className="flex items-center space-x-4 ml-auto">
          {/* Latency */}
          {latency !== null && (
            <div className="flex items-center space-x-1.5">
              <svg className="w-3 h-3 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className={getLatencyColor()}>{latency}ms</span>
            </div>
          )}

          {/* Connection status */}
          <div className="flex items-center space-x-1.5">
            <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className={isOnline ? 'text-green-500' : 'text-red-500'}>
              {isOnline ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Version */}
          <div className="text-zinc-600">
            v1.0.0
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
