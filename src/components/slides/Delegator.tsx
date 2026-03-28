"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import { ComputedStats } from "@/types";
import { getDelegatorNarrative } from "@/lib/narratives";

export default function Delegator({ stats }: { stats: ComputedStats }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const narrative = getDelegatorNarrative(stats);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 320, height = 320;
    const cx = width / 2, cy = height / 2;
    const g = svg.attr("viewBox", `0 0 ${width} ${height}`);

    const mainR = Math.max(30, Math.min(60, Math.sqrt(stats.totalMessages - stats.sidechainMessages) * 2));

    g.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 0)
      .attr("fill", "#ff6b35").attr("opacity", 0.9)
      .transition().duration(800).ease(d3.easeCubicOut).attr("r", mainR);

    g.append("text").attr("x", cx).attr("y", cy)
      .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
      .attr("fill", "white").attr("font-size", "11px")
      .attr("font-family", "Plus Jakarta Sans").attr("font-weight", "700")
      .attr("opacity", 0).text("You")
      .transition().delay(600).duration(400).attr("opacity", 1);

    if (stats.sidechainMessages > 0 || stats.agentToolCalls > 0) {
      const count = Math.min(stats.agentToolCalls, 30);
      const orbitR = mainR + 40;

      g.append("circle").attr("cx", cx).attr("cy", cy).attr("r", orbitR)
        .attr("fill", "none").attr("stroke", "#4a4946").attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,4").attr("opacity", 0)
        .transition().delay(600).duration(600).attr("opacity", 0.5);

      Array.from({ length: count }).forEach((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = cx + Math.cos(angle) * orbitR;
        const y = cy + Math.sin(angle) * orbitR;
        const r = Math.max(8, Math.min(25, Math.sqrt(stats.sidechainMessages / Math.max(count, 1)) * 3));

        g.append("line").attr("x1", cx).attr("y1", cy).attr("x2", cx).attr("y2", cy)
          .attr("stroke", "#ff6b35").attr("stroke-width", 1).attr("stroke-opacity", 0.2)
          .transition().delay(800 + i * 80).duration(500).attr("x2", x).attr("y2", y);

        g.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 0)
          .attr("fill", "#ffb59d").attr("opacity", 0.6)
          .transition().delay(800 + i * 80).duration(600).ease(d3.easeCubicOut)
          .attr("cx", x).attr("cy", y).attr("r", r);
      });
    }
  }, [stats]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 md:px-6 py-12 md:py-20 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-2 mb-4">
        <span className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Delegation Style</span>
        <h2 className="font-headline text-4xl md:text-7xl font-extrabold tracking-tight text-center text-glow">{narrative.archetypeLabel}</h2>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
        className="font-body text-lg md:text-xl italic text-on-surface-variant text-center max-w-md mb-6">{narrative.story}</motion.p>
      {/* GIF Mascot Placeholder */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="w-32 h-32 md:w-44 md:h-44 rounded-2xl overflow-hidden mb-4 md:mb-6">
        <img src="/mascots/delegator.png" alt="Delegator mascot" className="w-full h-full object-cover" />
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <svg ref={svgRef} className="w-56 h-56 md:w-80 md:h-80" />
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        className="mt-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Main</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-fixed-dim" />
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Agents</span>
        </div>
      </motion.div>
    </div>
  );
}
