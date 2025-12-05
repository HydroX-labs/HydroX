import * as React from "react";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("border-t border-[#00FFE0]/10", className)}>
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Icons.logo className="h-8 w-8" />
              <span className="font-bold text-xl text-[#00FFE0] drop-shadow-[0_0_10px_rgba(0,255,224,0.5)]">
                HydroX
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Decentralized Perpetual Exchange on Cardano. Trade BTC, ETH, SOL and more with stablecoin collateral.
            </p>
            <div className="flex gap-4">
              <a
                href="https://twitter.com/ADAPhilippines"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-[#00FFE0] transition-colors"
              >
                <Icons.twitter className="h-5 w-5 fill-current" />
              </a>
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-[#00FFE0] transition-colors"
              >
                <Icons.discord className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/HydroX-labs"
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-[#00FFE0] transition-colors"
              >
                <Icons.gitHub className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="opacity-50 cursor-not-allowed">
                  Launch App (Coming Soon)
                </span>
              </li>
              <li>
                <a href="/#features" className="hover:text-[#00FFE0] transition-colors">
                  Features
                </a>
              </li>
              <li>
                <span className="opacity-50 cursor-not-allowed">
                  Trading Pairs (Coming Soon)
                </span>
              </li>
              <li>
                <span className="opacity-50 cursor-not-allowed">
                  Fees (Coming Soon)
                </span>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="opacity-50 cursor-not-allowed">
                  Documentation (Coming Soon)
                </span>
              </li>
              <li>
                <span className="opacity-50 cursor-not-allowed">
                  API (Coming Soon)
                </span>
              </li>
              <li>
                <a 
                  href="https://github.com/HydroX-labs" 
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#00FFE0] transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#00FFE0]/10 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} HydroX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
