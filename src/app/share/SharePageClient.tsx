"use client";

import { decodeShareData, ShareData } from "@/lib/share";
import { getCharacterImage } from "@/lib/characterImages";
import { motion } from "framer-motion";
import Link from "next/link";
import CreditsPage from "@/components/reveal/CreditsPage";

interface Props {
  encoded: string | null;
}

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function fmtCost(cents: number): string {
  const usd = cents / 100;
  return usd >= 1 ? `$${usd.toFixed(0)}` : `$${usd.toFixed(2)}`;
}

function fmtHour(h: number): string {
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

export default function SharePageClient({ encoded }: Props) {
  const data: ShareData | null = encoded ? decodeShareData(encoded) : null;

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-6">
        <div className="fixed inset-0 grain-texture" />
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Invalid Share Link</h1>
          <p className="font-body text-on-surface/50 italic">
            This link doesn&apos;t contain valid Claude Code Rewind data.
          </p>
          <Link
            href="/"
            className="bg-primary hover:bg-primary-deep text-on-primary rounded-full px-8 py-3 font-label text-xs font-bold uppercase tracking-widest transition-all duration-200 hover:scale-105"
          >
            Create Your Own
          </Link>
        </div>
      </div>
    );
  }

  const pills = [
    `${fmt(data.totalTokens)} tokens`,
    `${fmt(data.totalMessages)} msgs`,
    fmtCost(data.estimatedCostCents),
  ];

  const msgsPerSession = data.totalSessions > 0 ? Math.round(data.totalMessages / data.totalSessions) : 0;

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="fixed inset-0 grain-texture" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center gap-8 w-full max-w-[680px]"
        >
          {/* Page title */}
          <div className="flex flex-col items-center gap-2 mb-2">
            <span className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-primary whitespace-nowrap">
              Claude Code Rewind
            </span>
            <h1 className="font-headline text-2xl md:text-4xl font-extrabold tracking-tight text-on-surface text-glow text-center">
              {data.username ? `${data.username}'s` : "Your"} Cards
            </h1>
          </div>

          {/* Two cards side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {/* Character card */}
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
                    <img src={getCharacterImage(data.name)} alt={data.name} className="w-full h-full object-cover" />
                  </div>
                  <h2 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface leading-tight">
                    {data.name}
                  </h2>
                  <p className="font-body text-sm md:text-base italic text-on-surface/60 max-w-xs">
                    &ldquo;{data.oneLiner}&rdquo;
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
                <p className="font-body text-xs italic text-primary/60 mt-3">{data.endingLine}</p>
              </div>
            </div>

            {/* Dev Stats card */}
            <div
              className="w-full rounded-3xl overflow-hidden border border-on-surface/10 bg-surface-dim"
              style={{ aspectRatio: "2 / 3" }}
            >
              <div className="w-full h-full flex flex-col justify-between px-6 py-7 md:px-8 md:py-9 relative overflow-hidden">
                {/* Grid bg */}
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage:
                      "linear-gradient(#faf9f5 1px, transparent 1px), linear-gradient(90deg, #faf9f5 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />

                {/* Header */}
                <div className="relative flex items-center justify-between">
                  <div>
                    <span className="font-label text-[10px] font-extrabold tracking-[0.2em] uppercase text-primary whitespace-nowrap">
                      Claude Code Rewind
                    </span>
                    <p className="font-label text-[8px] tracking-[0.25em] uppercase text-on-surface/25 whitespace-nowrap mt-0.5">
                      Dev Stats
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="font-label text-[8px] uppercase tracking-wider text-on-surface/20">peak</span>
                    <span className="font-headline text-sm font-extrabold text-primary">{fmtHour(data.peakHour)}</span>
                  </div>
                </div>

                {/* Hero — tokens */}
                <div className="relative flex flex-col gap-0.5 border-l-2 border-primary/60 pl-4 my-1">
                  <span className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface/30 whitespace-nowrap">
                    tokens burned
                  </span>
                  <span className="font-headline text-5xl md:text-6xl font-extrabold text-primary leading-none">
                    {fmt(data.totalTokens)}
                  </span>
                  <div className="flex gap-2 items-center mt-1">
                    <span className="font-label text-[8px] text-on-surface/30">{fmt(data.totalInputTokens)} in</span>
                    <span className="text-on-surface/15 text-[8px]">·</span>
                    <span className="font-label text-[8px] text-on-surface/30">{fmt(data.totalOutputTokens)} out</span>
                    <span className="text-on-surface/15 text-[8px]">·</span>
                    <span className="font-label text-[8px] text-on-surface/30">{fmt(data.totalCacheTokens)} cache</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="relative flex flex-col gap-1">
                  <span className="font-label text-[8px] uppercase tracking-[0.2em] text-on-surface/25 whitespace-nowrap">
                    messages sent
                  </span>
                  <span className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface leading-none">
                    {fmt(data.totalMessages)}
                  </span>
                </div>

                {/* Stat row */}
                <div className="relative grid grid-cols-3 gap-2 border-t border-on-surface/8 pt-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-label text-[8px] uppercase tracking-wider text-on-surface/25">cost</span>
                    <span className="font-headline text-xl font-extrabold text-on-surface">
                      {fmtCost(data.estimatedCostCents)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-label text-[8px] uppercase tracking-wider text-on-surface/25">sessions</span>
                    <span className="font-headline text-xl font-extrabold text-on-surface">{data.totalSessions}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-label text-[8px] uppercase tracking-wider text-on-surface/25">
                      msg/session
                    </span>
                    <span className="font-headline text-xl font-extrabold text-on-surface">{msgsPerSession}</span>
                  </div>
                </div>

                {/* Model + streak */}
                <div className="relative flex items-center justify-between border-t border-on-surface/8 pt-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-label text-[8px] uppercase tracking-wider text-on-surface/25">
                      primary model
                    </span>
                    <span className="font-label text-xs font-bold text-on-surface/70">{data.primaryModel}</span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="font-label text-[8px] uppercase tracking-wider text-on-surface/25">streak</span>
                    <span className="font-label text-xs font-bold text-on-surface/70">{data.longestStreak}d</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/"
            className="bg-primary hover:bg-primary-deep text-on-primary rounded-full px-8 py-3.5 font-label text-xs font-bold uppercase tracking-widest transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Create Your Own
          </Link>
        </motion.div>
      </div>

      {/* Credits */}
      <CreditsPage />
    </div>
  );
}
