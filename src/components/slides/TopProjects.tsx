"use client";

import { motion } from "framer-motion";
import { ComputedStats } from "@/types";
import { getTopProjectsNarrative } from "@/lib/narratives";

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

const MEDALS = ["#ff6b35", "#ffb59d", "#97908a"];
const MEDAL_LABELS = ["1st", "2nd", "3rd"];

export default function TopProjects({ stats }: { stats: ComputedStats }) {
  const narrative = getTopProjectsNarrative(stats);
  const top3 = stats.topProjectStats.slice(0, 3);
  const maxMessages = top3[0]?.messages || 1;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 md:px-6 py-12 md:py-20 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-2 mb-4">
        <span className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Top Projects</span>
        <h2 className="font-headline text-4xl md:text-7xl font-extrabold tracking-tight text-center text-glow">{narrative.archetypeLabel}</h2>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
        className="font-body text-lg md:text-xl italic text-on-surface-variant text-center max-w-md mb-8">{narrative.story}</motion.p>

      {/* Podium */}
      <div className="w-full max-w-lg flex flex-col gap-4">
        {top3.map((proj, i) => {
          const name = proj.name.split("/").pop() || proj.name;
          const barPct = (proj.messages / maxMessages) * 100;
          return (
            <motion.div
              key={proj.name}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-1.5"
            >
              {/* Project name row */}
              <div className="flex items-center gap-3">
                <span
                  className="font-headline text-lg md:text-xl font-extrabold shrink-0"
                  style={{ color: MEDALS[i] }}
                >
                  {MEDAL_LABELS[i]}
                </span>
                <span className="font-headline text-base md:text-lg font-bold text-on-surface truncate">{name}</span>
              </div>

              {/* Bar */}
              <div className="w-full h-8 md:h-10 bg-[#2f2f2d] rounded-lg overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barPct}%` }}
                  transition={{ delay: 0.9 + i * 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-lg flex items-center justify-end pr-3"
                  style={{ backgroundColor: MEDALS[i], minWidth: "60px" }}
                >
                  <span className="font-headline text-xs md:text-sm font-extrabold text-[#262624]">
                    {fmt(proj.messages)} msgs
                  </span>
                </motion.div>
              </div>

              {/* Sub stats */}
              <div className="flex gap-4 ml-1">
                {proj.tokens > 0 && (
                  <span className="font-label text-[9px] md:text-[10px] text-on-surface/40">
                    {fmt(proj.tokens)} tokens
                  </span>
                )}
                <span className="font-label text-[9px] md:text-[10px] text-on-surface/40">
                  {proj.sessions} session{proj.sessions !== 1 ? "s" : ""}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Total projects footer */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
        className="mt-8 flex items-center gap-6">
        <div className="text-center">
          <span className="font-headline text-2xl font-extrabold text-primary">{stats.projectCount}</span>
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface/40 ml-1">Total Projects</span>
        </div>
        <div className="h-6 w-px bg-on-surface/10" />
        <div className="text-center">
          <span className="font-headline text-2xl font-extrabold text-primary-fixed-dim">{fmt(stats.totalMessages)}</span>
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface/40 ml-1">Total Messages</span>
        </div>
      </motion.div>
    </div>
  );
}
