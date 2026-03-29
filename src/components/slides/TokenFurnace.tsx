"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ComputedStats } from "@/types";
import { getTokenFurnaceNarrative } from "@/lib/narratives";

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

const STRIP = [
  "1.2M",
  "3.4M",
  "7.8M",
  "19M",
  "999K",
  "48M",
  "2.1M",
  "16M",
  "5.5M",
  "12M",
  "33M",
  "8.7M",
  "21M",
  "4.4M",
  "66M",
];

function SlotMachineCanvas({ stats, onComplete }: { stats: ComputedStats; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const total = stats.totalTokens;
    const W = 400,
      H = 320;
    canvas.width = W;
    canvas.height = H;

    const reelDefs = [
      { label: "INPUT", value: fmt(stats.totalInputTokens), color: "#ff6b35", lockAt: 3200 },
      { label: "OUTPUT", value: fmt(stats.totalOutputTokens), color: "#ffb59d", lockAt: 5600 },
      {
        label: "CACHE",
        value: fmt(stats.totalCacheReadTokens + stats.totalCacheCreationTokens),
        color: "#ffdbd0",
        lockAt: 8200,
      },
    ];

    const REEL_W = 76,
      REEL_H = 90,
      GAP = 12;
    const totalW = reelDefs.length * REEL_W + (reelDefs.length - 1) * GAP;
    const startX = (W - totalW) / 2;

    // Layout: reels (90) + reel labels (20) + gap (16) + counter number (32) + counter label (18) = 176
    // Box padding top/bottom: 22px each → box height = 220
    const BOX_PAD = 22;
    const CONTENT_H = REEL_H + 20 + 16 + 32 + 18; // 176
    const BOX_H = CONTENT_H + BOX_PAD * 2; // 220
    const BOX_TOP = (H - BOX_H) / 2; // vertically centred in canvas
    const REEL_Y = BOX_TOP + BOX_PAD;
    const ROW_H = 34;

    const reels = reelDefs.map((def) => ({
      ...def,
      offset: 0,
      speed: 18,
      locked: false,
      flashAlpha: 0,
    }));

    let shakeX = 0,
      shakeY = 0;
    const startTime = performance.now();
    let counterVal = 0;
    let completed = false;
    let animId: number;

    function draw(now: number) {
      if (!ctx) return;
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#262624";
      ctx.fillRect(0, 0, W, H);

      shakeX *= 0.7;
      shakeY *= 0.7;
      ctx.save();
      ctx.translate(shakeX, shakeY);

      // machine body
      ctx.fillStyle = "#2f2f2d";
      roundRect(ctx, startX - 14, BOX_TOP, totalW + 28, BOX_H, 12);
      ctx.fill();
      ctx.strokeStyle = "#4a4946";
      ctx.lineWidth = 2;
      ctx.stroke();

      reels.forEach((reel, i) => {
        const x = startX + i * (REEL_W + GAP);
        const cy = REEL_Y + REEL_H / 2;

        if (!reel.locked) {
          const timeLeft = reel.lockAt - elapsed;
          if (timeLeft < 1400) reel.speed = Math.max(0.5, reel.speed * 0.92);
          reel.offset += reel.speed;
        }

        if (!reel.locked && elapsed >= reel.lockAt) {
          reel.locked = true;
          reel.speed = 0;
          reel.flashAlpha = 1;
          shakeX = (Math.random() - 0.5) * 14;
          shakeY = (Math.random() - 0.5) * 10;
        }

        if (reel.flashAlpha > 0) reel.flashAlpha -= 0.035;

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, REEL_Y, REEL_W, REEL_H);
        ctx.clip();

        ctx.fillStyle = "#1a1a18";
        roundRect(ctx, x, REEL_Y, REEL_W, REEL_H, 8);
        ctx.fill();

        if (reel.locked) {
          ctx.fillStyle = reel.color;
          ctx.font = `800 20px 'Plus Jakarta Sans', sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(reel.value, x + REEL_W / 2, cy);
        } else {
          const idx = Math.floor(reel.offset / ROW_H);
          const rowOffset = reel.offset % ROW_H;

          for (let r = -1; r <= 3; r++) {
            const val = STRIP[(idx + r) % STRIP.length];
            const ry = cy - ROW_H + r * ROW_H - rowOffset + ROW_H / 2;
            const distFromCentre = Math.abs(ry - cy);
            const alpha = Math.max(0, 1 - distFromCentre / (REEL_H * 0.6));
            ctx.globalAlpha = alpha;
            ctx.fillStyle = reel.color;
            ctx.font = `800 17px 'Plus Jakarta Sans', sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(val, x + REEL_W / 2, ry);
          }
          ctx.globalAlpha = 1;
        }

        ctx.restore();

        if (reel.flashAlpha > 0) {
          ctx.save();
          roundRect(ctx, x, REEL_Y, REEL_W, REEL_H, 8);
          ctx.clip();
          ctx.fillStyle = `rgba(255,107,53,${reel.flashAlpha * 0.45})`;
          ctx.fillRect(x, REEL_Y, REEL_W, REEL_H);
          ctx.restore();
        }

        ctx.fillStyle = "#97908a";
        ctx.font = `700 9px 'Plus Jakarta Sans', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(reel.label, x + REEL_W / 2, REEL_Y + REEL_H + 7);
      });

      ctx.restore();

      // total counter after last reel
      if (elapsed > reelDefs[2].lockAt + 500) {
        counterVal = Math.min(counterVal + total / 55, total);
        ctx.fillStyle = "#faf9f5";
        ctx.font = `800 28px 'Plus Jakarta Sans', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(fmt(Math.round(counterVal)), W / 2, REEL_Y + REEL_H + 20 + 16 + 16);
        ctx.fillStyle = "#ff6b35";
        ctx.font = `700 9px 'Plus Jakarta Sans', sans-serif`;
        ctx.textBaseline = "top";
        ctx.fillText("TOTAL TOKENS CONSUMED", W / 2, REEL_Y + REEL_H + 20 + 16 + 32 + 4);
        if (!completed && counterVal >= total) {
          completed = true;
          onComplete();
        }
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [stats]);

  return <canvas ref={canvasRef} style={{ width: 400, height: 320 }} className="rounded-xl" />;
}

export default function TokenFurnace({ stats }: { stats: ComputedStats }) {
  const narrative = getTokenFurnaceNarrative(stats);
  const [done, setDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/sounds/slot_machine.mp3");
    audio.preload = "auto";
    audio.volume = 0.3;
    audioRef.current = audio;
    // Play on mount (slot machine starts immediately)
    const play = () => {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };
    // Try immediately; if blocked by autoplay policy, play on first interaction
    play();
    const handler = () => play();
    window.addEventListener("click", handler, { once: true });
    window.addEventListener("touchstart", handler, { once: true });
    return () => {
      audio.pause();
      window.removeEventListener("click", handler);
      window.removeEventListener("touchstart", handler);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 md:px-6 py-8 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-4"
      >
        <span className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-primary">
          Token Consumption
        </span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 w-full flex justify-center"
      >
        <SlotMachineCanvas stats={stats} onComplete={() => setDone(true)} />
      </motion.div>
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-32 h-32 md:w-44 md:h-44 rounded-2xl overflow-hidden mb-4 md:mb-6"
          >
            <video
              src="/mascots/videos/token-furnace.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
