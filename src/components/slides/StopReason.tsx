"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import { ComputedStats } from "@/types";
import { getStopReasonNarrative } from "@/lib/narratives";

export default function StopReason({ stats }: { stats: ComputedStats }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const narrative = getStopReasonNarrative(stats);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 320, height = 260;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const total = Object.values(stats.stopReasonCounts).reduce((a, b) => a + b, 0);
    if (total === 0) return;

    const toolUse = stats.stopReasonCounts["tool_use"] || 0;
    const endTurn = stats.stopReasonCounts["end_turn"] || 0;
    const other = total - toolUse - endTurn;

    const segments = [
      { label: "Tool Use", value: toolUse, color: "#ff6b35" },
      { label: "End Turn", value: endTurn, color: "#ffb59d" },
    ];
    if (other > 0) segments.push({ label: "Other", value: other, color: "#4a4946" });

    const barY = 80, barHeight = 60, barWidth = width - 40, startX = 20;
    let x = startX;

    svg.append("text").attr("x", width / 2).attr("y", 40).attr("text-anchor", "middle")
      .attr("fill", "#97908a").attr("font-size", "10px")
      .attr("font-family", "Plus Jakarta Sans").attr("font-weight", "700")
      .text("HOW YOUR SESSIONS END");

    segments.forEach((seg, i) => {
      const w = (seg.value / total) * barWidth;
      const pct = Math.round((seg.value / total) * 100);

      svg.append("rect").attr("x", x).attr("y", barY).attr("width", 0).attr("height", barHeight)
        .attr("rx", i === 0 ? 8 : 0).attr("fill", seg.color).attr("opacity", 0.9)
        .transition().delay(400 + i * 200).duration(800).ease(d3.easeCubicOut).attr("width", w);

      if (w > 30) {
        svg.append("text").attr("x", x + w / 2).attr("y", barY + barHeight / 2)
          .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
          .attr("fill", i === 0 ? "white" : "#1b1c1a")
          .attr("font-size", "16px").attr("font-family", "Plus Jakarta Sans").attr("font-weight", "800")
          .attr("opacity", 0).text(`${pct}%`)
          .transition().delay(800 + i * 200).duration(400).attr("opacity", 1);
      }

      svg.append("text").attr("x", x + w / 2).attr("y", barY + barHeight + 24)
        .attr("text-anchor", "middle").attr("fill", seg.color)
        .attr("font-size", "10px").attr("font-family", "Plus Jakarta Sans").attr("font-weight", "700")
        .attr("opacity", 0).text(`${seg.label} (${seg.value})`)
        .transition().delay(1000 + i * 200).duration(400).attr("opacity", 1);

      x += w;
    });
  }, [stats]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 py-20 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-2 mb-4">
        <span className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Session Endings</span>
        <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight text-center text-glow">{narrative.archetypeLabel}</h2>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
        className="font-body text-lg md:text-xl italic text-on-surface-variant text-center max-w-md mb-8">{narrative.story}</motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-md">
        <svg ref={svgRef} className="w-full h-auto" />
      </motion.div>
    </div>
  );
}
