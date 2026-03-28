"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Character, ComputedStats, CPSBreakdown } from "@/types";

interface Props {
  character: Character;
  stats: ComputedStats;
  cps: CPSBreakdown;
}

export default function CharacterReveal({ character, stats, cps }: Props) {
  const [phase, setPhase] = useState(0);
  // Phase 0: dark, Phase 1: confetti + name, Phase 2: full reveal

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Build the dynamic story line
  const storyParts: string[] = [];
  if (stats.peakHour >= 22 || stats.peakHour <= 4) {
    const nightMsgs = stats.hourDistribution.slice(22).reduce((a, b) => a + b, 0) +
      stats.hourDistribution.slice(0, 5).reduce((a, b) => a + b, 0);
    storyParts.push(`You sent ${nightMsgs} messages between midnight and 4am.`);
  }
  if (stats.totalMessages > 100) {
    storyParts.push(`${stats.totalMessages.toLocaleString()} total messages.`);
  }
  if (stats.primaryModelPercentage > 0.8) {
    storyParts.push(`${Math.round(stats.primaryModelPercentage * 100)}% loyal to one model.`);
  }
  if (stats.longestStreak > 3) {
    storyParts.push(`${stats.longestStreak}-day streak.`);
  }

  const storyLine = storyParts.length > 0
    ? storyParts.slice(0, 3).join(" ") + ` You are ${character.name}.`
    : `You are ${character.name}.`;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 md:px-6 py-12 md:py-20 relative overflow-hidden">
      {/* Background grain */}
      <div className="fixed inset-0 grain-texture" />

      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[60%] bg-primary/5 blur-[120px] rounded-full" />

      {/* Confetti particles */}
      <AnimatePresence>
        {phase >= 1 && (
          <>
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: i % 2 === 0 ? -100 : window.innerWidth + 100,
                  y: Math.random() * window.innerHeight * 0.3,
                  rotate: 0,
                  opacity: 1,
                }}
                animate={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 100,
                  rotate: Math.random() * 720 - 360,
                  opacity: 0,
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: "easeOut",
                }}
                className="absolute pointer-events-none"
                style={{
                  width: 6 + Math.random() * 8,
                  height: 6 + Math.random() * 8,
                  backgroundColor: ["#ff6b35", "#ffb59d", "#ffdbd0", "#faf9f5", "#ab3500"][
                    Math.floor(Math.random() * 5)
                  ],
                  borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        {/* Archetype label */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mb-4"
            >
              <span className="font-label text-[10px] font-bold tracking-[0.4em] uppercase text-on-surface/40">
                Your Archetype
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Character name */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.h1
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 12,
                delay: 0.2,
              }}
              className="font-body text-4xl md:text-8xl lg:text-9xl italic leading-tight mb-4 md:mb-6"
            >
              You are{" "}
              <span className="block not-italic font-semibold text-primary text-glow">
                {character.name}
              </span>
            </motion.h1>
          )}
        </AnimatePresence>

        {/* GIF Mascot Placeholder */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="w-36 h-36 md:w-48 md:h-48 rounded-2xl overflow-hidden mb-4 md:mb-6"
            >
              <img src="/mascots/character-reveal.png" alt="Character reveal mascot" className="w-full h-full object-cover" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* One-liner */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="font-body text-xl md:text-2xl italic text-on-surface/80 max-w-lg mb-8"
            >
              &ldquo;{character.oneLiner}&rdquo;
            </motion.p>
          )}
        </AnimatePresence>

        {/* Dynamic story */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="font-label text-sm text-on-surface/50 max-w-md mb-10"
            >
              {storyLine}
            </motion.p>
          )}
        </AnimatePresence>

        {/* CPS Score badge */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 15 }}
              className="flex items-center gap-4 bg-surface-container-low/80 border border-on-surface/5 rounded-2xl px-8 py-4 mb-8"
            >
              <div className="text-center">
                <span className="font-headline text-4xl font-extrabold text-primary">
                  {cps.total}
                </span>
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">
                  Power Score
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ending line */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="h-12 w-px bg-gradient-to-b from-primary/50 to-transparent" />
              <span className="font-body text-lg italic text-primary/80">
                {character.endingLine}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
