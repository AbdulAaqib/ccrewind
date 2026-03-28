"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Character, ComputedStats, CPSBreakdown } from "@/types";
import { ShareData, buildShareURL } from "@/lib/share";
import { toPng } from "html-to-image";

interface Props {
  character: Character;
  stats: ComputedStats;
  cps: CPSBreakdown;
}

export default function ShareCard({ character, stats, cps }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

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
  };

  const shareURL = buildShareURL(shareData);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#262624",
        skipFonts: true,
        filter: (node: HTMLElement) => {
          // Skip link/style elements that reference cross-origin stylesheets
          if (node.tagName === "LINK" && (node as HTMLLinkElement).href?.includes("fonts.googleapis")) return false;
          return true;
        },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `cc-rewind-${character.name.toLowerCase().replace(/\s+/g, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Download failed:", e);
    } finally {
      setDownloading(false);
    }
  }, [downloading, character.name]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareURL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
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

  // Build stat pills
  const pills: string[] = [];
  if (stats.peakHour >= 22 || stats.peakHour <= 4) pills.push("Night Owl");
  if (stats.longestStreak > 7) pills.push(`${stats.longestStreak}-day streak`);
  if (stats.primaryModelPercentage > 0.8) pills.push(`${Math.round(stats.primaryModelPercentage * 100)}% loyal`);
  if (stats.totalMessages > 500) pills.push(`${stats.totalMessages.toLocaleString()} msgs`);
  if (stats.totalSessions > 50) pills.push(`${stats.totalSessions} sessions`);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 py-8 relative">
      {/* Background grain */}
      <div className="fixed inset-0 grain-texture" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center gap-6 max-w-lg w-full"
      >
        {/* The shareable card */}
        <div
          ref={cardRef}
          className="w-full rounded-3xl overflow-hidden border border-on-surface/10 bg-surface-dim"
          style={{ aspectRatio: "4 / 5" }}
        >
          <div className="w-full h-full flex flex-col items-center justify-between px-6 py-8 md:px-8 md:py-10 relative">
            {/* Top badge */}
            <div className="flex flex-col items-center gap-1">
              <span className="font-label text-[10px] font-extrabold tracking-[0.2em] uppercase text-primary">
                Claude Code Rewind
              </span>
              <span className="font-label text-[9px] tracking-[0.3em] uppercase text-on-surface/30">
                Your Claude Story
              </span>
            </div>

            {/* Center — character */}
            <div className="flex flex-col items-center text-center gap-3 flex-1 justify-center">
              {/* Mascot placeholder */}
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden">
                <img
                  src="/mascots/character-reveal.png"
                  alt="Character mascot"
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface leading-tight">
                {character.name}
              </h2>

              <p className="font-body text-sm md:text-base italic text-on-surface/60 max-w-xs">
                &ldquo;{character.oneLiner}&rdquo;
              </p>

              {/* CPS */}
              <div className="flex items-center gap-2 mt-2">
                <span className="font-headline text-4xl md:text-5xl font-extrabold text-primary">{cps.total}</span>
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">CPS</span>
              </div>
            </div>

            {/* Stat pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {pills.slice(0, 3).map((pill) => (
                <span
                  key={pill}
                  className="bg-surface-container-high/80 border border-on-surface/5 rounded-full px-3 py-1 font-label text-[10px] font-bold uppercase tracking-wider text-on-surface/50"
                >
                  {pill}
                </span>
              ))}
            </div>

            {/* Ending line */}
            <p className="font-body text-xs italic text-primary/60 mt-3">{character.endingLine}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 bg-primary hover:bg-primary-deep text-on-primary rounded-full px-6 py-3.5 font-label text-xs font-bold uppercase tracking-widest transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg
              width="16"
              height="16"
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
            {downloading ? "Saving..." : "Download Image"}
          </button>

          <button
            onClick={handleCopyLink}
            className="flex-1 bg-surface-container-high hover:bg-surface-container-highest border border-on-surface/10 text-on-surface rounded-full px-6 py-3.5 font-label text-xs font-bold uppercase tracking-widest transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <svg
              width="16"
              height="16"
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

        {/* Start over */}
        <button
          onClick={() => window.location.reload()}
          className="font-label text-sm font-bold tracking-widest uppercase text-on-surface/30 hover:text-on-surface/60 transition-all cursor-pointer mt-4"
        >
          Start Over
        </button>
      </motion.div>

      {/* Fixed scroll-down indicator at bottom of screen */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center cursor-pointer bg-surface-dim/80 backdrop-blur-sm rounded-full px-5 py-2.5 border border-on-surface/10"
        onClick={() => document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" })}
      >
        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface mb-1">Your Dashboard</span>
        <motion.svg
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-on-surface"
        >
          <path d="M7 13l5 5 5-5" />
        </motion.svg>
      </motion.div>
    </div>
  );
}
