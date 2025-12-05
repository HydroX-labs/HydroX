"use client";

import { BentoDemo } from "@/components/bento-features";
import ShineBorder from "@/components/magicui/shine-border";
import { Companies } from "@/components/social-proof";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";

function HeroPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-8 pt-6 md:pb-12 md:pt-10 lg:py-24">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FFE0]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00FFE0]/5 rounded-full blur-3xl" />
        </div>

        <div className="container flex max-w-[64rem] flex-col items-center gap-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ShineBorder
              className="text-center bg-muted/50 backdrop-blur px-6 py-2 text-sm font-medium"
              color={["#00FFE0", "#00D4AA", "#00FFE0"]}
            >
              🌊 Decentralized Perpetual Exchange on Cardano
            </ShineBorder>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
          >
            Trade Major Cryptos
            <br />
            <span className="text-[#00FFE0] drop-shadow-[0_0_25px_rgba(0,255,224,0.5)]">
              On Cardano
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-[46rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8"
          >
            Trade BTC, ETH, SOL, XRP and more perpetuals without leaving Cardano.
            Stablecoin-based collateral (USDM, USDA), leverage trading, and CEX-level experience — all decentralized.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mt-4"
          >
            <div
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-[#00FFE0]/20 text-[#00FFE0]/70 border border-[#00FFE0]/30 px-8 cursor-not-allowed hover:bg-[#00FFE0]/20"
              )}
            >
              <span className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFE0] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FFE0]"></span>
                </span>
                Launching Soon
              </span>
            </div>
            <a
              href="#features"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-[#00FFE0]/50 hover:bg-[#00FFE0]/10 hover:text-[#00FFE0] px-8"
              )}
            >
              Explore Features
            </a>
          </motion.div>

          {/* Supported Assets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            {["BTC", "ETH", "SOL", "XRP", "ADA", "CNT"].map((asset) => (
              <span
                key={asset}
                className="px-3 py-1 rounded-full text-sm border border-[#00FFE0]/20 bg-[#00FFE0]/5 text-muted-foreground"
              >
                {asset}
              </span>
            ))}
            <span className="px-3 py-1 rounded-full text-sm border border-[#00FFE0]/30 bg-[#00FFE0]/10 text-[#00FFE0]">
              + More
            </span>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <Companies />

      {/* Features Section */}
      <section
        id="features"
        className="container space-y-6 py-8 md:py-12 lg:py-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center"
        >
          <h3 className="text-sm font-semibold text-[#00FFE0] uppercase tracking-wider">
            Features
          </h3>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold">
            Why Trade on HydroX?
          </h2>
          <p className="max-w-[42rem] text-muted-foreground">
            CEX experience, DEX security. Trade major cryptos on Cardano.
          </p>
        </motion.div>
        <BentoDemo />
      </section>

      {/* CTA Section */}
      <section className="container py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-6 text-center rounded-2xl border border-[#00FFE0]/20 bg-gradient-to-b from-[#00FFE0]/5 to-transparent p-8 md:p-12"
        >
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl font-bold">
            Ready to Trade Without CEX?
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Join the waitlist and be the first to trade BTC, ETH, SOL perpetuals on Cardano.
            V2 with Hydra integration for lightning-fast execution coming soon.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://twitter.com/HydroXlabs"
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-[#00FFE0] hover:bg-[#00FFE0]/90 text-black font-semibold border-0 px-8"
              )}
            >
              Follow for Updates
            </a>
            <span
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-8 border-[#00FFE0]/30 opacity-50 cursor-not-allowed")}
            >
              Docs (Coming Soon)
            </span>
          </div>
        </motion.div>
      </section>
    </>
  );
}

export default HeroPage;
