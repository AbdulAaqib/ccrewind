"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import { ComputedStats } from "@/types";
import { getThinkingHoursNarrative } from "@/lib/narratives";

export default function ThinkingHours({ stats }: { stats: ComputedStats }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const narrative = getThinkingHoursNarrative(stats);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 320, height = 320;
    const cx = width / 2, cy = height / 2;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const totalMs = stats.estimatedThinkingTimeMs;
    const rings = 8, maxRadius = 140, minRadius = 30;
    const ringWidth = (maxRadius - minRadius) / rings;

    for (let i = 0; i < rings; i++) {
      const inner = minRadius + i * ringWidth;
      const outer = inner + ringWidth - 2;
      const fillRatio = Math.min(1, (totalMs / Math.max(1, 3600000)) * ((rings - i) / rings));

      const arc = d3.arc<null>().innerRadius(inner).outerRadius(outer).startAngle(0).cornerRadius(3);

      svg.append("path").attr("transform", `translate(${cx},${cy})`)
        .attr("d", arc.endAngle(Math.PI * 2)(null)).attr("fill", "#2f2f2d");

      svg.append("path").attr("transform", `translate(${cx},${cy})`)
        .attr("d", arc.endAngle(0)(null))
        .attr("fill", d3.interpolateRgb("#ff6b35", "#ffdbd0")(i / rings))
        .attr("opacity", 0.8)
        .transition().delay(300 + i * 120).duration(800).ease(d3.easeCubicOut)
        .attrTween("d", () => {
          const interp = d3.interpolate(0, fillRatio * Math.PI * 2);
          return (t: number) => arc.endAngle(interp(t))(null) || "";
        });
    }

    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);
    const label = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    svg.append("text").attr("x", cx).attr("y", cy - 8)
      .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
      .attr("fill", "#faf9f5").attr("font-size", "22px")
      .attr("font-family", "Plus Jakarta Sans").attr("font-weight", "800")
      .attr("opacity", 0).text(label)
      .transition().delay(1200).duration(400).attr("opacity", 1);

    svg.append("text").attr("x", cx).attr("y", cy + 14)
      .attr("text-anchor", "middle").attr("fill", "#97908a")
      .attr("font-size", "9px").attr("font-family", "Plus Jakarta Sans").attr("font-weight", "700")
      .text("THINKING TIME");
  }, [stats]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 md:px-6 py-12 md:py-20 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-2 mb-4">
        <span className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Claude&apos;s Thinking Time</span>
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
        <svg ref={svgRef} className="w-56 h-56 md:w-80 md:h-80" />
      </motion.div>
    </div>
  );
}
