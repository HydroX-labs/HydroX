"use client";

import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { Icons } from "@/components/icons";

const features = [
  {
    Icon: () => <Icons.coins className="h-12 w-12 text-[#00FFE0]" />,
    name: "Trade Major Cryptos",
    description: "BTC, ETH, SOL, XRP, ADA and more all tradeable as perpetuals on Cardano. No need to leave for CEX.",
    href: "#",
    cta: "Learn more",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-[#00FFE0]/20 to-transparent opacity-60" />
    ),
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: () => <Icons.stablecoin className="h-12 w-12 text-[#00FFE0]" />,
    name: "Stablecoin Collateral",
    description: "Trade with USDM or USDA as collateral. Stable value, no volatility risk on your margin.",
    href: "#",
    cta: "Learn more",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-[#00FFE0]/15 to-transparent opacity-60" />
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: () => <Icons.zap className="h-12 w-12 text-yellow-400" />,
    name: "V2: Hydra Powered",
    description: "V2 integrates with Hydra for lightning-fast execution and unmatched scalability.",
    href: "#",
    cta: "Learn more",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent opacity-60" />
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: () => <Icons.shield className="h-12 w-12 text-[#00FFE0]" />,
    name: "Non-Custodial",
    description: "Your keys, your coins. Trade directly from your wallet with full control.",
    href: "#",
    cta: "Learn more",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-[#00FFE0]/15 to-transparent opacity-60" />
    ),
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: () => <Icons.chart className="h-12 w-12 text-[#00FFE0]" />,
    name: "CEX-Level Experience",
    description: "Professional trading UI, leverage options, and smooth UX all without centralized custody.",
    href: "#",
    cta: "Learn more",
    background: (
      <div className="absolute inset-0 bg-gradient-to-br from-[#00FFE0]/15 to-transparent opacity-60" />
    ),
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

export function BentoDemo() {
  return (
    <BentoGrid className="lg:grid-rows-3">
      {features.map((feature) => (
        <BentoCard key={feature.name} {...feature} />
      ))}
    </BentoGrid>
  );
}
