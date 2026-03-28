"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import { ComputedStats } from "@/types";
import { getLoyaltyTestNarrative } from "@/lib/narratives";

export default function LoyaltyTest({ stats }: { stats: ComputedStats }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const narrative = getLoyaltyTestNarrative(stats);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 320, height = 380;
    const radius = 120, innerRadius = radius * 0.55;
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2 - 30})`);

    const modelEntries = Object.entries(stats.modelCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const total = modelEntries.reduce((a, b) => a + b[1], 0);
    if (total === 0) return;

    const colors = ["#ff6b35", "#ffb59d", "#ffdbd0", "#97908a", "#4a4946", "#2f2f2d"];

    const pie = d3.pie<[string, number]>().value((d) => d[1]).sort(null).padAngle(0.02);
    const arcGen = d3.arc<d3.PieArcDatum<[string, number]>>()
      .innerRadius(innerRadius).outerRadius(radius).cornerRadius(4);
    const arcs = pie(modelEntries);

    arcs.forEach((d, i) => {
      const path = g.append("path").datum(d).attr("fill", colors[i % colors.length]).attr("opacity", 0);
      path.transition().delay(400 + i * 150).duration(800).ease(d3.easeCubicOut)
        .attr("opacity", 0.9)
        .attrTween("d", () => {
          const interp = d3.interpolate({ ...d, startAngle: d.startAngle, endAngle: d.startAngle }, d);
          return (t: number) => arcGen(interp(t)) || "";
        });
    });

    g.append("text").attr("text-anchor", "middle").attr("dominant-baseline", "middle")
      .attr("fill", "#faf9f5").attr("font-size", "28px")
      .attr("font-family", "Plus Jakarta Sans").attr("font-weight", "800")
      .attr("opacity", 0).text(`${modelEntries.length}`)
      .transition().delay(800).duration(400).attr("opacity", 1);

    g.append("text").attr("text-anchor", "middle").attr("y", 20)
      .attr("fill", "#97908a").attr("font-size", "10px")
      .attr("font-family", "Plus Jakarta Sans").attr("font-weight", "700")
      .text(modelEntries.length === 1 ? "model" : "models");

    modelEntries.forEach((entry, i) => {
      const cleanName = entry[0].replace("claude-", "").replace(/-\d{8,}$/, "");
      const pct = Math.round((entry[1] / total) * 100);
      g.append("circle").attr("cx", -60).attr("cy", radius + 20 + i * 18).attr("r", 4).attr("fill", colors[i % colors.length]);
      g.append("text").attr("x", -50).attr("y", radius + 20 + i * 18)
        .attr("dominant-baseline", "middle").attr("fill", "#d3d2ce")
        .attr("font-size", "10px").attr("font-family", "Plus Jakarta Sans")
        .text(`${cleanName} — ${pct}%`);
    });
  }, [stats]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 md:px-6 py-12 md:py-20 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-2 mb-4">
        <span className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Model Loyalty</span>
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
        <svg ref={svgRef} className="w-56 h-72 md:w-80 md:h-96" />
      </motion.div>
    </div>
  );
}
