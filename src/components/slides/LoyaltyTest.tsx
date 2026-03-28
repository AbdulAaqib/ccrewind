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

    const modelEntries = Object.entries(stats.modelCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    const total = modelEntries.reduce((a, b) => a + b[1], 0);
    if (total === 0) return;

    const colors = ["#ff6b35", "#ffb59d", "#ffdbd0", "#97908a", "#4a4946"];
    const margin = { left: 130, right: 70, top: 24, bottom: 24 };
    const barH = 52,
      gap = 22;
    const width = 480;
    const height = modelEntries.length * (barH + gap) + margin.top + margin.bottom;
    const maxW = width - margin.left - margin.right;

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    modelEntries.forEach((entry, i) => {
      const cleanName = entry[0].replace("claude-", "").replace(/-\d{8,}$/, "");
      const pct = Math.round((entry[1] / total) * 100);
      const y = margin.top + i * (barH + gap);
      const barW = (entry[1] / total) * maxW;

      // label
      svg
        .append("text")
        .attr("x", margin.left - 10)
        .attr("y", y + barH / 2)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#d3d2ce")
        .attr("font-size", "16px")
        .attr("font-family", "Plus Jakarta Sans")
        .attr("font-weight", "700")
        .attr("opacity", 0)
        .text(cleanName)
        .transition()
        .delay(i * 100)
        .duration(400)
        .attr("opacity", 1);

      // track
      svg
        .append("rect")
        .attr("x", margin.left)
        .attr("y", y)
        .attr("width", maxW)
        .attr("height", barH)
        .attr("rx", 6)
        .attr("fill", "#2f2f2d");

      // bar
      svg
        .append("rect")
        .attr("x", margin.left)
        .attr("y", y)
        .attr("width", 0)
        .attr("height", barH)
        .attr("rx", 6)
        .attr("fill", colors[i % colors.length])
        .attr("opacity", 0.85)
        .transition()
        .delay(300 + i * 150)
        .duration(900)
        .ease(d3.easeCubicOut)
        .attr("width", barW);

      // pct
      svg
        .append("text")
        .attr("x", margin.left + barW + 10)
        .attr("y", y + barH / 2)
        .attr("dominant-baseline", "middle")
        .attr("fill", colors[i % colors.length])
        .attr("font-size", "18px")
        .attr("font-family", "Plus Jakarta Sans")
        .attr("font-weight", "800")
        .attr("opacity", 0)
        .text(`${pct}%`)
        .transition()
        .delay(900 + i * 150)
        .duration(400)
        .attr("opacity", 1);
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
        <span className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-primary">The Roster</span>
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
          src="/mascots/videos/loyalty-test.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <svg ref={svgRef} className="w-full" />
      </motion.div>
    </div>
  );
}
