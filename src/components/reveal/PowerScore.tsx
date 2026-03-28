"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CPSBreakdown } from "@/types";

interface Props {
  cps: CPSBreakdown;
}

function AnimatedCounter({ target, duration = 2000, delay = 0 }: { target: number; duration?: number; delay?: number }) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (startTime.current === null) startTime.current = timestamp;
        const elapsed = timestamp - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        setValue(Math.round(eased * target));

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };
      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);

  return <>{value}</>;
}

export default function PowerScore({ cps }: Props) {
  const breakdown = [
    { label: "Precision", value: cps.precisionIndex, max: 150, color: "#ff6b35" },
    { label: "Depth", value: cps.depthScore, max: 150, color: "#ffb59d" },
    { label: "Consistency", value: cps.consistency, max: 100, color: "#ffdbd0" },
    { label: "Loyalty", value: cps.loyaltyBonus, max: 100, color: "#ff6b35" },
    { label: "Completion", value: cps.completionRate, max: 150, color: "#ffb59d" },
    { label: "Velocity", value: cps.velocityScore, max: 100, color: "#ffdbd0" },
    { label: "Breadth", value: cps.topicBreadth, max: 100, color: "#ff6b35" },
    { label: "Streak", value: cps.streakBonus, max: 100, color: "#ffb59d" },
  ];

  if (cps.nightBonus > 0) {
    breakdown.push({ label: "Night Owl", value: cps.nightBonus, max: 50, color: "#ffdbd0" });
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 md:px-6 py-12 md:py-20 max-w-2xl mx-auto relative">
      <div className="fixed inset-0 grain-texture" />

      {/* Glow behind score */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center"
        >
          <span className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-primary">
            Claude Power Score
          </span>
        </motion.div>

        {/* Big score number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 150, damping: 12 }}
          className="text-center"
        >
          <span className="font-headline text-6xl md:text-9xl font-extrabold text-primary text-glow">
            <AnimatedCounter target={cps.total} duration={2500} delay={800} />
          </span>
          <p className="font-label text-sm uppercase tracking-widest text-on-surface/40 mt-2">
            out of 1,000
          </p>
        </motion.div>

        {/* Breakdown bars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="w-full max-w-sm space-y-3"
        >
          {breakdown.map((item, i) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="font-label text-[10px] font-bold uppercase tracking-wider text-on-surface/50 w-20 text-right">
                {item.label}
              </span>
              <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / item.max) * 100}%` }}
                  transition={{
                    delay: 1.5 + i * 0.1,
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
              <span className="font-label text-[10px] font-bold text-on-surface/40 w-10">
                {item.value}/{item.max}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Night bonus easter egg */}
        {cps.nightBonus > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="text-center"
          >
            <span className="font-label text-[10px] tracking-widest uppercase text-primary/60">
              +{cps.nightBonus} Night Owl Bonus
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
