"use client";

import { decodeShareData, ShareData } from "@/lib/share";
import { motion } from "framer-motion";
import Link from "next/link";

interface Props {
  encoded: string | null;
}

export default function SharePageClient({ encoded }: Props) {
  const data: ShareData | null = encoded ? decodeShareData(encoded) : null;

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-6">
        <div className="fixed inset-0 grain-texture" />
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">
            Invalid Share Link
          </h1>
          <p className="font-body text-on-surface/50 italic">
            This link doesn&apos;t contain valid CC Rewind data.
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

  // Build stat pills from share data
  const pills: string[] = [];
  if (data.peakHour >= 22 || data.peakHour <= 4) pills.push("Night Owl");
  if (data.longestStreak > 7) pills.push(`${data.longestStreak}-day streak`);
  if (data.primaryModelPct > 80) pills.push(`${data.primaryModelPct}% loyal`);
  if (data.totalMessages > 500) pills.push(`${data.totalMessages.toLocaleString()} msgs`);
  if (data.totalSessions > 50) pills.push(`${data.totalSessions} sessions`);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 py-8 relative">
      <div className="fixed inset-0 grain-texture" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center gap-6 max-w-lg w-full"
      >
        {/* The card */}
        <div
          className="w-full rounded-3xl overflow-hidden border border-on-surface/10 bg-surface-dim"
          style={{ aspectRatio: "4 / 5" }}
        >
          <div className="w-full h-full flex flex-col items-center justify-between px-6 py-8 md:px-8 md:py-10 relative">
            <div className="flex flex-col items-center gap-1">
              <span className="font-label text-[10px] font-extrabold tracking-[0.2em] uppercase text-primary">
                CC Rewind
              </span>
              <span className="font-label text-[9px] tracking-[0.3em] uppercase text-on-surface/30">
                Your Claude Story
              </span>
            </div>

            <div className="flex flex-col items-center text-center gap-3 flex-1 justify-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-dashed border-on-surface/10 flex items-center justify-center">
                <span className="font-label text-[8px] tracking-widest uppercase text-on-surface/20">
                  Mascot
                </span>
              </div>

              <h2 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface leading-tight">
                {data.name}
              </h2>

              <p className="font-body text-sm md:text-base italic text-on-surface/60 max-w-xs">
                &ldquo;{data.oneLiner}&rdquo;
              </p>

              <div className="flex items-center gap-2 mt-2">
                <span className="font-headline text-4xl md:text-5xl font-extrabold text-primary">
                  {data.cps}
                </span>
                <span className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">
                  CPS
                </span>
              </div>
            </div>

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

            <p className="font-body text-xs italic text-primary/60 mt-3">
              {data.endingLine}
            </p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/"
          className="bg-primary hover:bg-primary-deep text-on-primary rounded-full px-8 py-3.5 font-label text-xs font-bold uppercase tracking-widest transition-all duration-200 hover:scale-105 active:scale-95"
        >
          Create Your Own
        </Link>

        <p className="font-body text-[11px] italic text-on-surface/30">
          Upload your ~/.claude folder to get your Claude story.
        </p>
      </motion.div>
    </div>
  );
}
