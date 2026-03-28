"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import { ComputedStats } from "@/types";
import { getArsenalNarrative } from "@/lib/narratives";

export default function Arsenal({ stats }: { stats: ComputedStats }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const narrative = getArsenalNarrative(stats);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const tools = stats.topTools.slice(0, 8);
    if (tools.length === 0) return;

    const margin = { top: 10, right: 20, bottom: 10, left: 90 };
    const width = 400;
    const barHeight = 28, gap = 8;
    const height = tools.length * (barHeight + gap) + margin.top + margin.bottom;

    svg.attr("viewBox", `0 0 ${width} ${height}`);
    const maxCount = Math.max(...tools.map((t) => t.count), 1);
    const xScale = d3.scaleLinear().domain([0, maxCount]).range([0, width - margin.left - margin.right]);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    tools.forEach((tool, i) => {
      const y = i * (barHeight + gap);

      g.append("text").attr("x", -8).attr("y", y + barHeight / 2)
        .attr("text-anchor", "end").attr("dominant-baseline", "middle")
        .attr("fill", "#d3d2ce").attr("font-size", "11px")
        .attr("font-family", "Plus Jakarta Sans").attr("font-weight", "600")
        .attr("opacity", 0).text(tool.name)
        .transition().delay(i * 100).duration(400).attr("opacity", 1);

      g.append("rect").attr("x", 0).attr("y", y)
        .attr("width", xScale(maxCount)).attr("height", barHeight)
        .attr("rx", 4).attr("fill", "#2f2f2d");

      g.append("rect").attr("x", 0).attr("y", y).attr("width", 0).attr("height", barHeight)
        .attr("rx", 4)
        .attr("fill", i === 0 ? "#ff6b35" : "#ffb59d")
        .attr("opacity", i === 0 ? 1 : 0.4 + (0.6 * (tools.length - i)) / tools.length)
        .transition().delay(200 + i * 100).duration(700).ease(d3.easeCubicOut)
        .attr("width", xScale(tool.count));

      g.append("text").attr("x", xScale(tool.count) + 8).attr("y", y + barHeight / 2)
        .attr("dominant-baseline", "middle").attr("fill", "#97908a")
        .attr("font-size", "10px").attr("font-family", "Plus Jakarta Sans").attr("font-weight", "700")
        .attr("opacity", 0).text(tool.count.toLocaleString())
        .transition().delay(600 + i * 100).duration(400).attr("opacity", 1);
    });
  }, [stats]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 py-20 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-2 mb-4">
        <span className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Your Toolkit</span>
        <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight text-center text-glow">{narrative.archetypeLabel}</h2>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
        className="font-body text-lg md:text-xl italic text-on-surface-variant text-center max-w-md mb-8">{narrative.story}</motion.p>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-md">
        <svg ref={svgRef} className="w-full" />
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="mt-6 text-center">
        <span className="font-headline text-3xl font-extrabold text-primary">{narrative.stat}</span>
        <span className="font-label text-[10px] uppercase tracking-widest text-on-surface/40 ml-2">{narrative.statLabel}</span>
      </motion.div>
    </div>
  );
}
