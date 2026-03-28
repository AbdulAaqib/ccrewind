"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import { ComputedStats } from "@/types";
import { getTokenFurnaceNarrative } from "@/lib/narratives";

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default function TokenFurnace({ stats }: { stats: ComputedStats }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const narrative = getTokenFurnaceNarrative(stats);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 360, height = 280;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const gauges = [
      { label: "Input", value: stats.totalInputTokens, color: "#ff6b35" },
      { label: "Output", value: stats.totalOutputTokens, color: "#ffb59d" },
      { label: "Cache", value: stats.totalCacheReadTokens, color: "#ffdbd0" },
    ];
    const maxVal = Math.max(...gauges.map((g) => g.value), 1);
    const barWidth = 60;
    const spacing = (width - gauges.length * barWidth) / (gauges.length + 1);
    const maxBarHeight = 180;
    const bottomY = height - 50;

    gauges.forEach((gauge, i) => {
      const x = spacing + i * (barWidth + spacing);
      const barH = (gauge.value / maxVal) * maxBarHeight;

      svg.append("rect").attr("x", x).attr("y", bottomY - maxBarHeight)
        .attr("width", barWidth).attr("height", maxBarHeight).attr("rx", 8).attr("fill", "#2f2f2d");

      svg.append("rect").attr("x", x).attr("y", bottomY).attr("width", barWidth).attr("height", 0)
        .attr("rx", 8).attr("fill", gauge.color).attr("opacity", 0.9)
        .transition().delay(400 + i * 200).duration(1000).ease(d3.easeCubicOut)
        .attr("y", bottomY - barH).attr("height", barH);

      svg.append("text").attr("x", x + barWidth / 2).attr("y", bottomY - barH - 10)
        .attr("text-anchor", "middle").attr("fill", gauge.color)
        .attr("font-size", "13px").attr("font-family", "Plus Jakarta Sans").attr("font-weight", "800")
        .attr("opacity", 0).text(fmt(gauge.value))
        .transition().delay(1000 + i * 200).duration(400).attr("opacity", 1);

      svg.append("text").attr("x", x + barWidth / 2).attr("y", bottomY + 20)
        .attr("text-anchor", "middle").attr("fill", "#97908a")
        .attr("font-size", "10px").attr("font-family", "Plus Jakarta Sans").attr("font-weight", "700")
        .text(gauge.label);
    });
  }, [stats]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 md:px-6 py-12 md:py-20 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-2 mb-4">
        <span className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Token Consumption</span>
        <h2 className="font-headline text-4xl md:text-7xl font-extrabold tracking-tight text-center text-glow">{narrative.archetypeLabel}</h2>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
        className="font-body text-lg md:text-xl italic text-on-surface-variant text-center max-w-md mb-6">{narrative.story}</motion.p>
      {/* GIF Mascot Placeholder */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-2 border-dashed border-on-surface/10 flex items-center justify-center mb-4 md:mb-6">
        <span className="font-label text-[9px] tracking-widest uppercase text-on-surface/20">Mascot GIF</span>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <svg ref={svgRef} className="w-64 h-52 md:w-96 md:h-72" />
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
        className="mt-4 text-center">
        <span className="font-headline text-3xl font-extrabold text-primary">{narrative.stat}</span>
        <span className="font-label text-[10px] uppercase tracking-widest text-on-surface/40 ml-2">{narrative.statLabel}</span>
      </motion.div>
    </div>
  );
}
