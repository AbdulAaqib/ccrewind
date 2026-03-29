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

    const cellSize = 11,
      cellGap = 2,
      total = cellSize + cellGap;
    const LABEL_W = 22,
      MONTH_H = 16;
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const activeSet = new Set(dates);
    const activityMap = new Map<string, number>();
    for (const day of stats.dailyActivity) activityMap.set(day.date, day.messageCount);
    for (const date of dates) {
      if (!activityMap.has(date)) {
        const seed = date.split("-").reduce((a, b) => a + parseInt(b), 0);
        activityMap.set(date, 1 + (seed % 8));
      }
    }

    // Build a 52-week grid ending today, starting on Monday
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const gridEnd = new Date(today);
    const gridStart = new Date(today);
    gridStart.setDate(gridStart.getDate() - 52 * 7);
    // Snap gridStart back to the nearest Monday
    const startDow = (gridStart.getDay() + 6) % 7; // 0=Mon
    gridStart.setDate(gridStart.getDate() - startDow);

    const displayDays: string[] = [];
    const d = new Date(gridStart);
    while (d <= gridEnd) {
      displayDays.push(d.toISOString().split("T")[0]);
      d.setDate(d.getDate() + 1);
    }

    const weeksCount = Math.ceil(displayDays.length / 7);
    const width = LABEL_W + weeksCount * total;
    const height = MONTH_H + 7 * total;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const maxActivity = Math.max(...Array.from(activityMap.values()), 1);
    const colorScale = d3
      .scaleSequential(d3.interpolateRgbBasis(["#2f2f2d", "#ff6b35", "#ffdbd0"]))
      .domain([0, maxActivity]);

    const g = svg.append("g").attr("transform", `translate(${LABEL_W}, ${MONTH_H})`);

    // Day-of-week labels
    ["M", "", "W", "", "F", "", "S"].forEach((label, i) => {
      if (label) {
        g.append("text")
          .attr("x", -5)
          .attr("y", i * total + cellSize / 2)
          .attr("text-anchor", "end")
          .attr("dominant-baseline", "middle")
          .attr("fill", "#97908a")
          .attr("font-size", "8px")
          .attr("font-family", "Plus Jakarta Sans")
          .text(label);
      }
    });

    // Month labels — emit when the month changes at start of a week
    let lastMonth = -1;
    displayDays.forEach((day, idx) => {
      const dow = idx % 7;
      const weekIdx = Math.floor(idx / 7);
      if (dow === 0) {
        const month = new Date(day + "T12:00:00").getMonth();
        if (month !== lastMonth) {
          g.append("text")
            .attr("x", weekIdx * total)
            .attr("y", -4)
            .attr("text-anchor", "start")
            .attr("fill", "#97908a")
            .attr("font-size", "8px")
            .attr("font-family", "Plus Jakarta Sans")
            .text(MONTHS[month]);
          lastMonth = month;
        }
      }
    });

    // Cells — stagger delay capped so animation doesn't take forever
    displayDays.forEach((day, idx) => {
      const dow = idx % 7;
      const weekIdx = Math.floor(idx / 7);
      const activity = activityMap.get(day) || 0;
      const isActive = activeSet.has(day);

      g.append("rect")
        .attr("x", weekIdx * total)
        .attr("y", dow * total)
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("rx", 2)
        .attr("fill", "#2f2f2d")
        .attr("opacity", 0)
        .transition()
        .delay(Math.min(weekIdx * 20, 800))
        .duration(300)
        .attr("opacity", 1)
        .attr("fill", isActive ? colorScale(activity) : "#2f2f2d");
    });
  }, [stats]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 md:px-6 py-12 md:py-20 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-2 mb-4"
      >
        <span className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Your Projects</span>
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
      {/* GIF Mascot Placeholder */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="w-32 h-32 md:w-44 md:h-44 rounded-2xl overflow-hidden mb-4 md:mb-6"
      >
        <video
          src="/mascots/videos/commit-history.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg overflow-x-auto"
      >
        <svg ref={svgRef} className="w-full min-w-[300px]" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-6 flex items-center gap-6"
      >
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
