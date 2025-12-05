"use client";

import { motion } from "framer-motion";
import { Icons } from "./icons";

const features = [
  { label: "Collateral", value: "USDM / USDA", icon: "stablecoin" },
  { label: "Leverage", value: "Available", icon: "chart" },
  { label: "Network", value: "Cardano", icon: "cardano" },
  { label: "V2 Speed", value: "Hydra", icon: "zap" },
];

const assets = ["BTC", "ETH", "SOL", "XRP", "ADA"];

export function Companies() {
  return (
    <section id="stats" className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-6 rounded-xl border border-[#00FFE0]/20 bg-[#00FFE0]/5"
            >
              <div className="text-2xl md:text-3xl font-bold text-[#00FFE0] drop-shadow-[0_0_10px_rgba(0,255,224,0.3)]">
                {feature.value}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {feature.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tradeable Assets */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">Trade perpetuals for</p>
          <div className="flex flex-wrap justify-center gap-4">
            {assets.map((asset, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#00FFE0]/20 bg-[#00FFE0]/5"
              >
                <span className="font-medium text-white">{asset}</span>
                <span className="text-muted-foreground text-sm">/PERP</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Cardano Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-[#00FFE0]/30 bg-[#00FFE0]/5">
            <Icons.cardano className="h-6 w-6 text-[#00FFE0]" />
            <span className="text-muted-foreground">
              Built natively on <span className="text-[#00FFE0] font-medium">Cardano</span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
