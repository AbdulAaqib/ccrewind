"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ComputedStats } from "@/types";
import { getBillNarrative } from "@/lib/narratives";

function AnimatedCounter({
  target,
  duration = 2000,
  delay = 0,
  prefix = "",
}: {
  target: number;
  duration?: number;
  delay?: number;
  prefix?: string;
}) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (startTime.current === null) startTime.current = timestamp;
        const elapsed = timestamp - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(eased * target);
        if (progress < 1) rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
    }, delay);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);

  return (
    <>
      {prefix}
      {value.toFixed(2)}
    </>
  );
}

function shortModel(model: string): string {
  return model
    .replace(/^claude-/, "")
    .replace(/-\d{8}$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function TheBill({ stats }: { stats: ComputedStats }) {
  const narrative = getBillNarrative(stats);
  const [done, setDone] = useState(false);
  const cost = stats.estimatedCostUSD;
  const topModels = stats.costByModel.slice(0, 5);
  const maxCost = topModels[0]?.cost || 1;

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), 3200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const audio = new Audio("/sounds/cha-ching.mp3");
      audio.volume = 0.6;
      audio.play().catch(() => {});
    }, 800);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 md:px-6 py-8 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-4"
      >
        <span className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-primary">The Bill</span>
      </motion.div>

      {/* Big dollar amount */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 150, damping: 12 }}
        className="mb-2 text-center"
      >
        <span className="font-headline text-6xl md:text-9xl font-extrabold text-primary text-glow">
          <AnimatedCounter target={cost} duration={2500} delay={600} prefix="$" />
        </span>
        <p className="font-label text-sm uppercase tracking-widest text-on-surface/40 mt-2">estimated spend</p>
      </motion.div>

      {/* Cost breakdown by model */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="w-full max-w-sm space-y-3 mb-6"
      >
        {topModels.map((item, i) => (
          <div key={item.model} className="flex items-center gap-3">
            <span className="font-label text-[10px] font-bold uppercase tracking-wider text-on-surface/50 w-24 text-right truncate">
              {shortModel(item.model)}
            </span>
            <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.cost / maxCost) * 100}%` }}
                transition={{ delay: 1.5 + i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full"
                style={{ backgroundColor: i === 0 ? "#ff6b35" : i === 1 ? "#ffb59d" : "#ffdbd0" }}
              />
            </div>
            <span className="font-label text-[10px] font-bold text-on-surface/40 w-16 text-right">
              ${item.cost.toFixed(2)}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Mascot */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="w-32 h-32 md:w-44 md:h-44 rounded-2xl overflow-hidden mb-4 md:mb-6"
      >
        <img src="/mascots/token-furnace.png" alt="The bill mascot" className="w-full h-full object-cover" />
      </motion.div>

      {/* Narrative */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-2"
          >
            <h2 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight text-center text-glow">
              {narrative.archetypeLabel}
            </h2>
            <p className="font-body text-base md:text-lg italic text-on-surface-variant text-center max-w-md">
              {narrative.story}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
