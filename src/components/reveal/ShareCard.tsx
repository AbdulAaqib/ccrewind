"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Character, ComputedStats, CPSBreakdown } from "@/types";
import { ShareData, buildShareURL } from "@/lib/share";
import { getCharacterImage } from "@/lib/characterImages";
import { toPng } from "html-to-image";
import StatsCard from "./StatsCard";

interface Props {
  character: Character;
  stats: ComputedStats;
  cps: CPSBreakdown;
}

const STATS_VARIANTS = [1, 2, 3, 4, 5] as const;
// Total carousel items: character card (index 0) + 5 stats variants
const TOTAL = 1 + STATS_VARIANTS.length;

export default function ShareCard({ character, stats, cps }: Props) {
  const activeCardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const shareData: ShareData = {
    name: character.name,
    oneLiner: character.oneLiner,
    endingLine: character.endingLine,
    cps: cps.total,
    totalMessages: stats.totalMessages,
    longestStreak: stats.longestStreak,
    peakHour: stats.peakHour,
    primaryModelPct: Math.round(stats.primaryModelPercentage * 100),
    totalSessions: stats.totalSessions,
    totalTokens: stats.totalTokens,
    totalInputTokens: stats.totalInputTokens,
    totalOutputTokens: stats.totalOutputTokens,
    totalCacheTokens: stats.totalCacheReadTokens + stats.totalCacheCreationTokens,
    estimatedCostCents: Math.round(stats.estimatedCostUSD * 100),
    primaryModel: stats.primaryModel,
    username: stats.username,
  };

  const shareURL = buildShareURL(shareData);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActiveIdx((i) => (i + 1) % TOTAL);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveIdx((i) => (i - 1 + TOTAL) % TOTAL);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!activeCardRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(activeCardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#262624",
        skipFonts: true,
        filter: (node: HTMLElement) => {
          if (node.tagName === "LINK" && (node as HTMLLinkElement).href?.includes("fonts.googleapis")) return false;
          return true;
        },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download =
        activeIdx === 0
          ? `cc-rewind-${character.name.toLowerCase().replace(/\s+/g, "-")}.png`
          : `cc-rewind-stats-${activeIdx}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Download failed:", e);
    } finally {
      setDownloading(false);
    }
  }, [downloading, activeIdx, character.name]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareURL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = shareURL;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareURL]);

  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : n.toLocaleString();
  const fmtCost = (n: number) => (n >= 1 ? `$${n.toFixed(0)}` : `$${n.toFixed(2)}`);
  const pills = [
    `${fmt(stats.totalTokens)} tokens`,
    `${fmt(stats.totalMessages)} msgs`,
    fmtCost(stats.estimatedCostUSD),
  ];

  // ─── Ring geometry ───
  const RADIUS = 300;
  const angleStep = (2 * Math.PI) / TOTAL;

  function getCardStyle(i: number) {
    let diff = i - activeIdx;
    if (diff > TOTAL / 2) diff -= TOTAL;
    if (diff < -TOTAL / 2) diff += TOTAL;

    const angle = diff * angleStep;
    const x = Math.sin(angle) * RADIUS;
    const z = Math.cos(angle) * RADIUS - RADIUS;
    const scale = 0.55 + 0.45 * ((z + RADIUS) / RADIUS);
    const opacity = diff === 0 ? 1 : Math.max(0.15, 0.6 - Math.abs(diff) * 0.15);
    const zIndex = Math.round((z + RADIUS) * 10);

    return {
      transform: `translateX(${x}px) translateZ(${z}px) scale(${scale})`,
      opacity,
      zIndex,
      transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      position: "absolute" as const,
      left: 0,
      right: 0,
    };
  }

  // ─── Character card content (index 0 in carousel) ───
  const CharacterCard = (
    <div
      className="w-full rounded-3xl overflow-hidden border border-on-surface/10 bg-surface-dim"
      style={{ aspectRatio: "2 / 3" }}
    >
      <div className="w-full h-full flex flex-col items-center justify-between px-6 py-8 md:px-8 md:py-10 relative">
        <div className="flex flex-col items-center gap-1">
          <span className="font-label text-[10px] font-extrabold tracking-[0.2em] uppercase text-primary whitespace-nowrap">
            Claude Code Rewind
          </span>
          <span className="font-label text-[9px] tracking-[0.3em] uppercase text-on-surface/30 whitespace-nowrap">
            Your Claude Story
          </span>
        </div>
        <div className="flex flex-col items-center text-center gap-3 flex-1 justify-center">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden">
            <img src={getCharacterImage(character.name)} alt={character.name} className="w-full h-full object-cover" />
          </div>
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface leading-tight">
            {character.name}
          </h2>
          <p className="font-body text-sm md:text-base italic text-on-surface/60 max-w-xs">
            &ldquo;{character.oneLiner}&rdquo;
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {pills.map((pill) => (
            <span
              key={pill}
              className="bg-surface-container-high/80 border border-on-surface/5 rounded-full px-3 py-1 font-label text-[10px] font-bold uppercase tracking-wider text-on-surface/50 whitespace-nowrap"
            >
              {pill}
            </span>
          ))}
        </div>
        <p className="font-body text-xs italic text-primary/60 mt-3">{character.endingLine}</p>
      </div>
    </div>
  );

  // All carousel items: character card first, then stats variants
  const carouselItems = [
    { key: "character", content: CharacterCard },
    ...STATS_VARIANTS.map((v) => ({
      key: `stats-${v}`,
      content: <StatsCard stats={stats} variant={v} />,
    })),
  ];

  return (
    <div className="flex flex-col items-center px-4 md:px-6 py-8 pb-32 relative min-h-screen">
      <div className="fixed inset-0 grain-texture" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-4xl flex flex-col items-center"
      >
        {/* Page title */}
        <div className="flex flex-col items-center gap-2 mb-10">
          <span className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-primary whitespace-nowrap">
            Claude Code Rewind
          </span>
          <h1 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface text-glow">
            Your Cards
          </h1>
        </div>

        {/* Carousel ring */}
        <div
          className="relative w-full max-w-[400px] mx-auto mb-8"
          style={{ perspective: "1200px", height: "min(85vh, 660px)" }}
        >
          <div className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}>
            {carouselItems.map((item, i) => {
              const style = getCardStyle(i);
              const isFront = i === activeIdx;
              return (
                <div key={item.key} className="cursor-pointer" style={style} onClick={() => setActiveIdx(i)}>
                  <div ref={isFront ? activeCardRef : undefined}>{item.content}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveIdx((i) => (i - 1 + TOTAL) % TOTAL)}
            className="w-10 h-10 rounded-full border border-on-surface/10 flex items-center justify-center text-on-surface/40 hover:text-on-surface hover:border-on-surface/30 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="flex gap-2">
            {carouselItems.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className="transition-all duration-300"
                style={{
                  width: i === activeIdx ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i === activeIdx ? "#ff6b35" : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>

          <button
            onClick={() => setActiveIdx((i) => (i + 1) % TOTAL)}
            className="w-10 h-10 rounded-full border border-on-surface/10 flex items-center justify-center text-on-surface/40 hover:text-on-surface hover:border-on-surface/30 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 w-full max-w-[400px] mb-4">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 bg-primary hover:bg-primary-deep text-on-primary rounded-full px-5 py-3 font-label text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {downloading ? "..." : "Download"}
          </button>
          <button
            onClick={handleCopyLink}
            className="flex-1 bg-surface-container-high hover:bg-surface-container-highest border border-on-surface/10 text-on-surface rounded-full px-5 py-3 font-label text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            {copied ? "Copied!" : "Share"}
          </button>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="font-label text-sm font-bold tracking-widest uppercase text-on-surface/30 hover:text-on-surface/60 transition-all cursor-pointer mt-2"
        >
          Start Over
        </button>
      </motion.div>
    </div>
  );
}
