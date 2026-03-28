"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import { ComputedStats } from "@/types";
import { getCommitHistoryNarrative } from "@/lib/narratives";

export default function CommitHistory({ stats }: { stats: ComputedStats }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const narrative = getCommitHistoryNarrative(stats);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const dates = stats.activeDates;
    if (dates.length === 0) return;

    const cellSize = 14, cellGap = 3, total = cellSize + cellGap;
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[dates.length - 1]);

    const allDays: string[] = [];
    const d = new Date(startDate);
    while (d <= endDate) {
      allDays.push(d.toISOString().split("T")[0]);
      d.setDate(d.getDate() + 1);
    }
    const displayDays = allDays.length > 70 ? allDays.slice(-70) : allDays;
    const activeSet = new Set(dates);

    const activityMap = new Map<string, number>();
    for (const day of stats.dailyActivity) activityMap.set(day.date, day.messageCount);

    const weeksCount = Math.ceil(displayDays.length / 7);
    const width = weeksCount * total + 40, height = 7 * total + 30;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const maxActivity = Math.max(...Array.from(activityMap.values()), 1);
    const colorScale = d3.scaleSequential(
      d3.interpolateRgbBasis(["#2f2f2d", "#ff6b35", "#ffdbd0"])
    ).domain([0, maxActivity]);

    const g = svg.append("g").attr("transform", "translate(30, 20)");

    ["M", "", "W", "", "F", "", "S"].forEach((label, i) => {
      if (label) {
        g.append("text").attr("x", -8).attr("y", i * total + cellSize / 2)
          .attr("text-anchor", "end").attr("dominant-baseline", "middle")
          .attr("fill", "#97908a").attr("font-size", "8px").attr("font-family", "Plus Jakarta Sans")
          .text(label);
      }
    });

    displayDays.forEach((day, idx) => {
      const dayOfWeek = (new Date(day).getDay() + 6) % 7;
      const week = Math.floor(idx / 7);
      const activity = activityMap.get(day) || 0;
      const isActive = activeSet.has(day);

      g.append("rect").attr("x", week * total).attr("y", dayOfWeek * total)
        .attr("width", cellSize).attr("height", cellSize).attr("rx", 3)
        .attr("fill", "#2f2f2d").attr("opacity", 0)
        .transition().delay(idx * 15).duration(300)
        .attr("opacity", 1).attr("fill", isActive ? colorScale(activity) : "#2f2f2d");
    });
  }, [stats]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 py-20 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-2 mb-4">
        <span className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Your Projects</span>
        <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight text-center text-glow">{narrative.archetypeLabel}</h2>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
        className="font-body text-lg md:text-xl italic text-on-surface-variant text-center max-w-md mb-8">{narrative.story}</motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-lg overflow-x-auto">
        <svg ref={svgRef} className="w-full min-w-[300px]" />
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="mt-6 flex items-center gap-6">
        <div className="text-center">
          <span className="font-headline text-2xl font-extrabold text-primary">{stats.projectCount}</span>
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface/40 ml-1">Projects</span>
        </div>
        <div className="h-6 w-px bg-on-surface/10" />
        <div className="text-center">
          <span className="font-headline text-2xl font-extrabold text-primary-fixed-dim">{stats.branchCount}</span>
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface/40 ml-1">Branches</span>
        </div>
      </motion.div>
    </div>
  );
}
