"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ComputedStats } from "@/types";
import { getThinkingHoursNarrative } from "@/lib/narratives";

function fmt(ms: number): string {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function BrainwaveCanvas({ stats }: { stats: ComputedStats }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 400,
      H = 220;
    canvas.width = W;
    canvas.height = H;

    const fillRatio = Math.min(1, stats.estimatedThinkingTimeMs / 7_200_000);
    const amp = 18 + fillRatio * 52;
    const freq = 0.025 + fillRatio * 0.02;
    const label = fmt(stats.estimatedThinkingTimeMs);

    let t = 0;
    let animId: number;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#262624";
      ctx.fillRect(0, 0, W, H);

      const cy = H / 2 + 20;

      // track line
      ctx.strokeStyle = "#2f2f2d";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(W, cy);
      ctx.stroke();

      // wave
      ctx.beginPath();
      for (let x = 0; x <= W; x++) {
        const envelope = Math.sin((x / W) * Math.PI);
        const y = cy + Math.sin(x * freq + t) * amp * envelope;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "#ff6b35";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#ff6b35";
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // glow fill below wave
      const grad = ctx.createLinearGradient(0, cy - amp, 0, cy + amp);
      grad.addColorStop(0, "rgba(255,107,53,0.18)");
      grad.addColorStop(1, "rgba(255,107,53,0)");
      ctx.beginPath();
      for (let x = 0; x <= W; x++) {
        const envelope = Math.sin((x / W) * Math.PI);
        const y = cy + Math.sin(x * freq + t) * amp * envelope;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(W, cy);
      ctx.lineTo(0, cy);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // label top left
      ctx.fillStyle = "#faf9f5";
      ctx.font = "800 32px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(label, 16, 12);

      ctx.fillStyle = "#97908a";
      ctx.font = "700 10px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("THINKING TIME", 16, 52);

      t += 0.035;
      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animId);
  }, [stats]);

  return <canvas ref={canvasRef} style={{ width: 400, height: 220 }} className="rounded-xl" />;
}

export default function ThinkingHours({ stats }: { stats: ComputedStats }) {
  const narrative = getThinkingHoursNarrative(stats);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 md:px-6 py-12 md:py-20 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-2 mb-4"
      >
        <span className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-primary">
          Claude&apos;s Thinking Time
        </span>
        <h2 className="font-headline text-4xl md:text-7xl font-extrabold tracking-tight text-center text-glow">
          {narrative.archetypeLabel}
        </h2>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="font-body text-lg md:text-xl italic text-on-surface-variant text-center max-w-md mb-6"
      >
        {narrative.story}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="w-32 h-32 md:w-44 md:h-44 rounded-2xl overflow-hidden mb-4 md:mb-6"
      >
        <img src="/mascots/thinking-hours.png" alt="Thinking hours mascot" className="w-full h-full object-cover" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <BrainwaveCanvas stats={stats} />
      </motion.div>
    </div>
  );
}
