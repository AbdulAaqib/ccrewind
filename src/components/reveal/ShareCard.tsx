"use client";

import { useRef, useState, useCallback, useEffect, TouchEvent } from "react";
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

import { ALL_CHARACTERS, RARITY_COLORS } from "./CharacterReveal";

function getRarityForCharacter(name: string) {
  const match = ALL_CHARACTERS.find((c) => c.name === name);
  return RARITY_COLORS[match?.rarity ?? "common"];
}

const STATS_VARIANTS = [1, 2, 3, 4, 5] as const;
// Total carousel items: character card (index 0) + 5 stats variants
const TOTAL = 1 + STATS_VARIANTS.length;

function arrayBufferToBase64(buf: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export default function ShareCard({ character, stats, cps }: Props) {
  const activeCardRef = useRef<HTMLDivElement>(null);
  const fontEmbedCSSRef = useRef<string>("");
  const carouselTouchStartX = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [pastDashboard, setPastDashboard] = useState(false);
  const [pastCredits, setPastCredits] = useState(false);
  const rarityStyle = getRarityForCharacter(character.name);
  const rarity = ALL_CHARACTERS.find((c) => c.name === character.name)?.rarity ?? "common";

  // Pre-fetch and base64-embed Google Fonts on mount so toPng doesn't hit CORS
  useEffect(() => {
    async function prefetchFonts() {
      try {
        const cssUrl =
          "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap";
        const css = await fetch(cssUrl).then((r) => r.text());
        const urls = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map((m) => m[1]);
        let embedded = css;
        await Promise.all(
          urls.map(async (url) => {
            try {
              const buf = await fetch(url).then((r) => r.arrayBuffer());
              const mime = url.includes(".woff2") ? "font/woff2" : "font/woff";
              embedded = embedded.replace(url, `data:${mime};base64,${arrayBufferToBase64(buf)}`);
            } catch (e) {
              console.warn("font embed failed", e);
            }
          })
        );
        fontEmbedCSSRef.current = embedded;
      } catch (e) {
        console.warn("font prefetch failed", e);
      }
    }
    prefetchFonts();
  }, []);

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

  useEffect(() => {
    const onScroll = () => {
      const dashEl = document.getElementById("dashboard");
      const credEl = document.getElementById("credits");
      if (dashEl) setPastDashboard(window.scrollY + window.innerHeight / 2 > dashEl.offsetTop);
      if (credEl) setPastCredits(window.scrollY + window.innerHeight / 2 > credEl.offsetTop);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleDownload = useCallback(async () => {
    if (downloading || !activeCardRef.current) return;
    setDownloading(true);

    const opts = {
      pixelRatio: 2,
      backgroundColor: "#262624",
      fontEmbedCSS: fontEmbedCSSRef.current,
      filter: (node: HTMLElement) => {
        if (node.tagName === "LINK" && (node as HTMLLinkElement).href?.includes("fonts.googleapis")) return false;
        return true;
      },
    };

    try {
      const cardName = activeIdx === 0 ? "character" : `stats-${activeIdx}`;
      const url = await toPng(activeCardRef.current, opts);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cc-rewind-${character.name.toLowerCase().replace(/\s+/g, "-")}-${cardName}.png`;
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

  // ─── Final glow system ───
  const rc = rarityStyle;
  const INTENSITY: Record<string, number> = { common: 0.35, uncommon: 0.55, rare: 0.8, epic: 1.0, legendary: 1.4 };
  const k = INTENSITY[rarity] ?? 0.35;
  const op = (base: number) =>
    Math.min(255, Math.round(base * k))
      .toString(16)
      .padStart(2, "0");
  const baseInset = -Math.round(55 * k);
  const bk = rarity === "legendary" ? k * 1.5 : k;
  const bop = (base: number) =>
    Math.min(255, Math.round(base * bk))
      .toString(16)
      .padStart(2, "0");

  const CharacterCard = (
    <div className="relative w-full" style={{ aspectRatio: "2 / 3" }}>
      {/* Base inner furnace — all rarities */}
      <div
        className="absolute pointer-events-none rounded-3xl"
        style={{
          top: baseInset,
          left: baseInset,
          right: baseInset,
          bottom: baseInset,
          zIndex: 0,
          background: `radial-gradient(circle at 50% 50%, ${rc.border}${bop(0x55)} 0%, ${rc.border}${bop(0x28)} 25%, ${rc.border}${bop(0x10)} 50%, transparent 70%)`,
          filter: `blur(${Math.round(22 * k)}px)`,
        }}
      />

      {/* Rare: barely-there plasma blob */}
      {rarity === "rare" && (
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: 70,
            height: 50,
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(ellipse at 50% 50%, ${rc.border}18 0%, transparent 70%)`,
            filter: "blur(16px)",
            zIndex: 0,
            animation: "sc-plasma-a 5s ease-in-out infinite",
          }}
        />
      )}

      {/* Epic: two plasma blobs */}
      {rarity === "epic" && (
        <>
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: 200,
              height: 120,
              top: "35%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(ellipse at 50% 50%, ${rc.border}${op(0x70)} 0%, ${rc.border}${op(0x35)} 45%, transparent 85%)`,
              filter: "blur(26px)",
              zIndex: 0,
              animation: "sc-plasma-a 4s ease-in-out infinite",
            }}
          />
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: 120,
              height: 170,
              top: "55%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(ellipse at 50% 50%, ${rc.border}${op(0x60)} 0%, ${rc.border}${op(0x28)} 45%, transparent 80%)`,
              filter: "blur(24px)",
              zIndex: 0,
              animation: "sc-plasma-b 5s ease-in-out infinite",
            }}
          />
        </>
      )}

      {/* Legendary: single large gold blob */}
      {rarity === "legendary" && (
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: 220,
            height: 220,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -52%)",
            background: `radial-gradient(circle at 50% 50%, ${rc.border}${op(0x99)} 0%, ${rc.border}${op(0x55)} 40%, ${rc.border}${op(0x1a)} 65%, transparent 85%)`,
            filter: "blur(32px)",
            zIndex: 0,
            animation: "sc-plasma-a 4s ease-in-out infinite",
          }}
        />
      )}

      <style>{`
        @keyframes sc-plasma-a {
          0%, 100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 0.7; }
          50% { transform: translate(-50%, -50%) scale(1.15) rotate(12deg); opacity: 1; }
        }
        @keyframes sc-plasma-b {
          0%, 100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.12) rotate(-10deg); opacity: 0.9; }
        }
      `}</style>

      {/* Card */}
      <div
        className="relative w-full h-full rounded-3xl overflow-hidden"
        style={{ zIndex: 1, backgroundColor: "rgba(30, 30, 28, 0.92)", border: `1px solid ${rc.border}15` }}
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
            <div
              className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden"
              style={{ boxShadow: `0 0 20px ${rc.glow}, 0 0 40px ${rc.glow}` }}
            >
              <img
                src={getCharacterImage(character.name)}
                alt={character.name}
                className="w-full h-full object-cover"
              />
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
    <div className="flex flex-col items-center px-4 md:px-6 py-6 pb-40 relative min-h-screen">
      <div className="fixed inset-0 grain-texture" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(600px,100vw)] h-[min(600px,100vw)] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

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
          className="relative w-full max-w-[320px] md:max-w-[360px] mx-auto mb-4"
          style={{ perspective: "1200px", height: "min(55vh, 480px)" }}
          onTouchStart={(e: TouchEvent<HTMLDivElement>) => {
            carouselTouchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e: TouchEvent<HTMLDivElement>) => {
            if (carouselTouchStartX.current === null) return;
            const dx = e.changedTouches[0].clientX - carouselTouchStartX.current;
            carouselTouchStartX.current = null;
            if (Math.abs(dx) < 40) return;
            if (dx < 0) setActiveIdx((i) => (i + 1) % TOTAL);
            else setActiveIdx((i) => (i - 1 + TOTAL) % TOTAL);
          }}
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

        {/* Navigation — below cards */}
        <div className="relative z-10 flex items-center gap-4 mt-6">
          <button
            onClick={() => setActiveIdx((i) => (i - 1 + TOTAL) % TOTAL)}
            className="w-8 h-8 rounded-full border border-on-surface/10 flex items-center justify-center text-on-surface/40 hover:text-on-surface hover:border-on-surface/30 transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="flex gap-2">
            {carouselItems.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className="transition-all duration-300 flex items-center justify-center p-2"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <span
                  className="block transition-all duration-300"
                  style={{
                    width: i === activeIdx ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: i === activeIdx ? "#ff6b35" : "rgba(255,255,255,0.15)",
                  }}
                />
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveIdx((i) => (i + 1) % TOTAL)}
            className="w-8 h-8 rounded-full border border-on-surface/10 flex items-center justify-center text-on-surface/40 hover:text-on-surface hover:border-on-surface/30 transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </motion.div>

      {/* Fixed bottom bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 flex flex-col items-center gap-2 pb-5 pt-6"
        style={{ background: "linear-gradient(to top, #262624 55%, rgba(38,38,36,0.7) 85%, transparent)" }}
      >
        {/* Action buttons */}
        <div className="flex gap-2 w-full max-w-[320px]">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 bg-primary hover:bg-primary-deep text-on-primary rounded-full px-4 py-2 font-label text-[9px] font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <svg
              width="11"
              height="11"
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
            className="flex-1 bg-surface-container-high hover:bg-surface-container-highest border border-on-surface/10 text-on-surface rounded-full px-4 py-2 font-label text-[9px] font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
          >
            <svg
              width="11"
              height="11"
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

        <div className="flex items-center gap-5">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 font-label text-[10px] font-bold tracking-widest uppercase text-on-surface/30 hover:text-on-surface/60 transition-all cursor-pointer"
          >
            Start Over
          </button>
          <button
            onClick={() => {
              if (pastDashboard) window.scrollTo({ top: 0, behavior: "smooth" });
              else document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex items-center gap-1.5 font-label text-[10px] font-bold tracking-widest uppercase text-on-surface/30 hover:text-on-surface/60 transition-all cursor-pointer"
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              if (pastCredits) window.scrollTo({ top: 0, behavior: "smooth" });
              else document.getElementById("credits")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex items-center gap-1.5 font-label text-[10px] font-bold tracking-widest uppercase text-on-surface/30 hover:text-on-surface/60 transition-all cursor-pointer"
          >
            Credits
          </button>
        </div>
      </div>
    </div>
  );
}
