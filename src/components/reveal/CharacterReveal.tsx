"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Character, ComputedStats, CPSBreakdown } from "@/types";
import { getCharacterImage } from "@/lib/characterImages";

interface Props {
  character: Character;
  stats: ComputedStats;
  cps: CPSBreakdown;
}

type Rarity = "common" | "uncommon" | "rare" | "legendary" | "mythical";

interface CrateCharacter {
  name: string;
  image: string;
  rarity: Rarity;
}

const RARITY_COLORS: Record<Rarity, { border: string; glow: string; bg: string; label: string }> = {
  common: { border: "#8b98a5", glow: "rgba(139,152,165,0.3)", bg: "rgba(139,152,165,0.08)", label: "Common" },
  uncommon: { border: "#4caf50", glow: "rgba(76,175,80,0.4)", bg: "rgba(76,175,80,0.08)", label: "Uncommon" },
  rare: { border: "#4b69ff", glow: "rgba(75,105,255,0.5)", bg: "rgba(75,105,255,0.08)", label: "Rare" },
  legendary: { border: "#f5c642", glow: "rgba(245,198,66,0.6)", bg: "rgba(245,198,66,0.1)", label: "Legendary" },
  mythical: { border: "#b347ff", glow: "rgba(179,71,255,0.65)", bg: "rgba(179,71,255,0.08)", label: "Mythical" },
};

const ALL_CHARACTERS: CrateCharacter[] = [
  { name: "The Intern", image: "/mascots/char-the-intern.png", rarity: "common" },
  { name: "The Degen", image: "/mascots/char-the-degen.png", rarity: "common" },
  { name: "The SBF", image: "/mascots/char-the-ghost.png", rarity: "uncommon" },
  { name: "The Sama", image: "/mascots/char-the-sensei.png", rarity: "uncommon" },
  { name: "The Quant", image: "/mascots/char-the-quant.png", rarity: "rare" },
  { name: "The Musk", image: "/mascots/char-the-chaos-agent.png", rarity: "rare" },
  { name: "The Dario", image: "/mascots/char-the-visionary.png", rarity: "legendary" },
  { name: "The Torvalds", image: "/mascots/char-the-night-shift-engineer.png", rarity: "legendary" },
  { name: "Slough Boy", image: "/mascots/char-the-researcher.png", rarity: "mythical" },
];

// Seeded shuffle for deterministic strip order
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = (s >>> 0) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const CARD_W_SM = 120;
const CARD_W_LG = 180;
const CARD_GAP = 8;

function getCardW() {
  if (typeof window === "undefined") return CARD_W_SM;
  return window.innerWidth >= 768 ? CARD_W_LG : CARD_W_SM;
}

export default function CharacterReveal({ character, stats, cps: _cps }: Props) {
  const [phase, setPhase] = useState<"waiting" | "spinning" | "landed" | "reveal">("waiting");
  const stripRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardW, setCardW] = useState(CARD_W_SM);

  useEffect(() => {
    setCardW(getCardW());
    const onResize = () => setCardW(getCardW());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const cardTotal = cardW + CARD_GAP;

  // Build the crate strip: ~60 cards, target character placed near the end
  const { strip, targetIndex } = useMemo(() => {
    const targetChar = ALL_CHARACTERS.find((c) => c.name === character.name) ?? ALL_CHARACTERS[0];
    const others = ALL_CHARACTERS.filter((c) => c.name !== character.name);

    // Build 6 loops of shuffled characters
    const cards: CrateCharacter[] = [];
    for (let loop = 0; loop < 6; loop++) {
      const shuffled = seededShuffle(ALL_CHARACTERS, 42 + loop);
      cards.push(...shuffled);
    }

    // Place target at a fixed position near the end
    const landIdx = cards.length - 5;
    cards[landIdx] = targetChar;

    // Make sure the card right before and after aren't the same character
    if (cards[landIdx - 1]?.name === targetChar.name) {
      cards[landIdx - 1] = others[0];
    }
    if (cards[landIdx + 1]?.name === targetChar.name) {
      cards[landIdx + 1] = others[1];
    }

    return { strip: cards, targetIndex: landIdx };
  }, [character.name]);

  // Build the dynamic story line
  const storyLine = useMemo(() => {
    const parts: string[] = [];
    if (stats.peakHour >= 22 || stats.peakHour <= 4) {
      const nightMsgs =
        stats.hourDistribution.slice(22).reduce((a, b) => a + b, 0) +
        stats.hourDistribution.slice(0, 5).reduce((a, b) => a + b, 0);
      parts.push(`You sent ${nightMsgs} messages between midnight and 4am.`);
    }
    if (stats.totalMessages > 100) parts.push(`${stats.totalMessages.toLocaleString()} total messages.`);
    if (stats.primaryModelPercentage > 0.8)
      parts.push(`${Math.round(stats.primaryModelPercentage * 100)}% loyal to one model.`);
    if (stats.longestStreak > 3) parts.push(`${stats.longestStreak}-day streak.`);
    return parts.length > 0
      ? parts.slice(0, 3).join(" ") + ` You are ${character.name}.`
      : `You are ${character.name}.`;
  }, [stats, character.name]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSpin = () => {
    if (phase === "waiting") {
      const audio = new Audio("/sounds/crate_opening.mp3");
      audio.currentTime = 7;
      audio.play().catch(() => {});
      audioRef.current = audio;
      setPhase("spinning");
    }
  };

  // Animate the strip scroll
  useEffect(() => {
    if (phase !== "spinning" || !stripRef.current || !containerRef.current) return;

    const containerW = containerRef.current.offsetWidth;
    // Scroll so the target card is centered in the container
    const targetOffset = targetIndex * cardTotal - containerW / 2 + cardW / 2;

    const el = stripRef.current;
    el.style.transition = "none";
    el.style.transform = "translateX(0px)";

    // Force reflow
    void el.offsetHeight;

    // Animate with CSS transition — heavy deceleration curve
    el.style.transition = "transform 6s cubic-bezier(0.15, 0.85, 0.22, 1)";
    el.style.transform = `translateX(-${targetOffset}px)`;

    const onEnd = () => {
      setPhase("landed");
      setTimeout(() => setPhase("reveal"), 1200);
    };

    el.addEventListener("transitionend", onEnd, { once: true });
    return () => el.removeEventListener("transitionend", onEnd);
  }, [phase, targetIndex, cardW, cardTotal]);

  const targetRarity = ALL_CHARACTERS.find((c) => c.name === character.name)?.rarity ?? "common";
  const rarityStyle = RARITY_COLORS[targetRarity];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 md:px-6 py-12 md:py-20 relative overflow-hidden">
      {/* Background grain */}
      <div className="fixed inset-0 grain-texture" />

      {/* Background glow on reveal */}
      <AnimatePresence>
        {phase === "reveal" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[60%] blur-[120px] rounded-full"
            style={{ backgroundColor: rarityStyle.glow }}
          />
        )}
      </AnimatePresence>

      {/* Confetti on land — fixed position, full viewport burst */}
      <AnimatePresence>
        {(phase === "landed" || phase === "reveal") && (
          <>
            {Array.from({ length: 80 }).map((_, i) => {
              const side = i % 2 === 0 ? -1 : 1;
              const startX = side === -1 ? -5 : 105;
              const endX = 15 + Math.random() * 70;
              const startY = 20 + Math.random() * 30;
              const size = 8 + Math.random() * 14;
              return (
                <motion.div
                  key={`confetti-${i}`}
                  initial={{
                    left: `${startX}%`,
                    top: `${startY}%`,
                    rotate: 0,
                    opacity: 1,
                    scale: 1,
                  }}
                  animate={{
                    left: `${endX}%`,
                    top: `${90 + Math.random() * 20}%`,
                    rotate: Math.random() * 1080 - 540,
                    opacity: 0,
                    scale: Math.random() * 0.5 + 0.5,
                  }}
                  transition={{
                    duration: 2.5 + Math.random() * 2.5,
                    delay: Math.random() * 0.8,
                    ease: [0.2, 0.8, 0.3, 1],
                  }}
                  className="fixed pointer-events-none z-50"
                  style={{
                    width: size,
                    height: size,
                    backgroundColor: [
                      rarityStyle.border,
                      rarityStyle.border,
                      "#ff6b35",
                      "#ffb59d",
                      "#ffdbd0",
                      "#faf9f5",
                    ][Math.floor(Math.random() * 6)],
                    borderRadius: Math.random() > 0.4 ? "50%" : "2px",
                  }}
                />
              );
            })}
          </>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-2xl">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-6"
        >
          <p className="font-headline text-3xl md:text-5xl font-extrabold tracking-tight uppercase text-on-surface text-glow">Your Archetype</p>
        </motion.div>

        {/* Crate opening strip — visible during waiting, spinning, and landed */}
        <AnimatePresence>
          {(phase === "waiting" || phase === "spinning" || phase === "landed") && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="w-full relative mb-8"
            >
              {/* Center indicator arrow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20">
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-primary" />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 z-20">
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[10px] border-l-transparent border-r-transparent border-b-primary" />
              </div>

              {/* Center highlight line */}
              <div
                className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-2 border-primary/60 rounded-xl z-10 pointer-events-none"
                style={{ width: cardW + 4 }}
              />

              {/* Scrolling strip container */}
              <div
                ref={containerRef}
                className="overflow-hidden rounded-xl bg-surface-dim/80 border border-on-surface/5 py-3 md:py-4"
              >
                <div ref={stripRef} className="flex gap-2 will-change-transform" style={{ paddingLeft: 8 }}>
                  {strip.map((card, i) => {
                    const r = RARITY_COLORS[card.rarity];
                    return (
                      <div
                        key={i}
                        className="flex-shrink-0 flex flex-col items-center gap-1.5 md:gap-2 rounded-lg p-2 md:p-3"
                        style={{
                          width: cardW,
                          backgroundColor: r.bg,
                          borderBottom: `3px solid ${r.border}`,
                        }}
                      >
                        <div className="w-16 h-16 md:w-24 md:h-24 rounded-lg overflow-hidden">
                          <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                        </div>
                        <span
                          className="font-label text-[8px] md:text-[10px] font-bold tracking-wider uppercase text-center leading-tight"
                          style={{ color: r.border }}
                        >
                          {card.name.replace("The ", "")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Edge fade overlays */}
              <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-surface-dim to-transparent z-10 pointer-events-none rounded-l-xl" />
              <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-surface-dim to-transparent z-10 pointer-events-none rounded-r-xl" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spin button — visible during waiting */}
        <AnimatePresence>
          {phase === "waiting" && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              onClick={handleSpin}
              className="bg-primary hover:bg-primary-deep text-on-primary rounded-full px-10 py-4 font-label text-sm font-extrabold uppercase tracking-[0.2em] transition-all duration-200 hover:scale-105 active:scale-95 mb-6 shadow-lg shadow-primary/25"
            >
              Open Crate
            </motion.button>
          )}
        </AnimatePresence>

        {/* Flash effect on land */}
        <AnimatePresence>
          {phase === "landed" && (
            <motion.div
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="fixed inset-0 z-40 pointer-events-none"
              style={{ backgroundColor: rarityStyle.border }}
            />
          )}
        </AnimatePresence>

        {/* Rarity label on land */}
        <AnimatePresence>
          {phase === "landed" && (
            <motion.div
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <span
                className="font-label text-sm font-extrabold tracking-[0.3em] uppercase"
                style={{ color: rarityStyle.border }}
              >
                {RARITY_COLORS[targetRarity].label}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full reveal after crate opening */}
        <AnimatePresence>
          {phase === "reveal" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              {/* Character name */}
              <motion.h1
                initial={{ opacity: 0, y: 40, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.2 }}
                className="font-body leading-tight mb-4 md:mb-6"
              >
                <span className="block text-2xl md:text-4xl italic text-on-surface/50 mb-1">You are</span>
                <span
                  className="block text-5xl md:text-8xl lg:text-9xl not-italic font-semibold"
                  style={{ color: rarityStyle.border, textShadow: `0 0 40px ${rarityStyle.glow}` }}
                >
                  {character.name}
                </span>
              </motion.h1>

              {/* Mascot */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="w-36 h-36 md:w-48 md:h-48 rounded-2xl overflow-hidden mb-4 md:mb-6 relative"
                style={{ boxShadow: `0 0 40px ${rarityStyle.glow}, 0 0 80px ${rarityStyle.glow}` }}
              >
                <img
                  src={getCharacterImage(character.name)}
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* One-liner */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="font-body text-xl md:text-2xl italic text-on-surface/80 max-w-2xl mb-6"
              >
                &ldquo;{character.oneLiner}&rdquo;
              </motion.p>

              {/* Story line */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="font-label text-sm text-on-surface/50 max-w-2xl mb-8"
              >
                {storyLine}
              </motion.p>

              {/* Ending line */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.8 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="h-12 w-px bg-gradient-to-b from-primary/50 to-transparent" />
                <span className="font-body text-lg italic text-primary/80">{character.endingLine}</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
