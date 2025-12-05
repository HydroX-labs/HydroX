import { MainNav } from "@/components/main-nav";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteFooter } from "@/components/site-footer";
import MobileNav from "@/components/mobile-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HydroX - Decentralized Perpetual Exchange on Cardano",
  description: "Trade BTC, ETH, SOL, XRP perpetuals on Cardano. Stablecoin collateral (USDM, USDA), leverage trading, and CEX-level experience all decentralized.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          inter.className,
          "relative flex min-h-screen w-full flex-col scroll-smooth bg-background antialiased"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-[#00FFE0]/10 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 items-center justify-between">
                <MobileNav />
                <MainNav />
                <nav className="flex items-center gap-4">
                  <Link
                    href="#"
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "bg-[#00FFE0]/20 text-[#00FFE0]/70 border border-[#00FFE0]/30 hidden sm:inline-flex cursor-not-allowed hover:bg-[#00FFE0]/20"
                    )}
                  >
                    Coming Soon
                  </Link>
                </nav>
              </div>
            </header>

            <main className="flex-1">{children}</main>

            <SiteFooter />
          </div>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
