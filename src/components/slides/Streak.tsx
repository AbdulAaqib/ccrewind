"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import { ComputedStats } from "@/types";
import { getStreakNarrative } from "@/lib/narratives";

export default function Streak({ stats }: { stats: ComputedStats }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const narrative = getStreakNarrative(stats);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const dates = stats.activeDates;
    if (dates.length === 0) return;

    const activityMap = new Map<string, number>();
    for (const day of stats.dailyActivity) activityMap.set(day.date, day.messageCount);

    const cellSize = 18, gap = 3, total = cellSize + gap;
    const maxCells = 49;
    const displayDates = dates.slice(-maxCells);
    const cols = 7;
    const rows = Math.ceil(displayDates.length / cols);

    const width = cols * total + 20, height = rows * total + 20;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const maxActivity = Math.max(...displayDates.map((d) => activityMap.get(d) || 1), 1);
    const colorScale = d3.scaleSequential(
      d3.interpolateRgbBasis(["#383835", "#ff6b35", "#ffdbd0"])
    ).domain([0, maxActivity]);

    const g = svg.append("g").attr("transform", "translate(10, 10)");
    const dateSet = new Set(dates);

    displayDates.forEach((date, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const activity = activityMap.get(date) || 1;

      g.append("rect").attr("x", col * total).attr("y", row * total)
        .attr("width", cellSize).attr("height", cellSize).attr("rx", 4)
        .attr("fill", "#2f2f2d").attr("opacity", 0)
        .transition().delay(idx * 30).duration(400).ease(d3.easeCubicOut)
        .attr("opacity", 1).attr("fill", dateSet.has(date) ? colorScale(activity) : "#2f2f2d");
    });
  }, [stats]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 py-20 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-2 mb-4">
        <span className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Consistency</span>
        <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight text-center text-glow">{narrative.archetypeLabel}</h2>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
        className="font-body text-lg md:text-xl italic text-on-surface-variant text-center max-w-md mb-8">{narrative.story}</motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="flex justify-center">
        <svg ref={svgRef} className="w-auto h-auto max-w-sm" />
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="mt-8 flex items-center gap-6">
        <div className="text-center">
          <span className="font-headline text-3xl font-extrabold text-primary">{stats.longestStreak}</span>
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Best Streak</p>
        </div>
        <div className="h-8 w-px bg-on-surface/10" />
        <div className="text-center">
          <span className="font-headline text-3xl font-extrabold text-primary-fixed-dim">{stats.totalActiveDays}</span>
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface/40">Active Days</p>
        </div>
      </motion.div>
    </div>
  );
}
