"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import { ComputedStats } from "@/types";
import { getRetrySpiralNarrative } from "@/lib/narratives";

export default function RetrySpiral({ stats }: { stats: ComputedStats }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const narrative = getRetrySpiralNarrative(stats);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const size = 300;
    const cx = size / 2, cy = size / 2;
    svg.attr("viewBox", `0 0 ${size} ${size}`);

    const rsi = stats.retrySpiral;
    // More coils for higher RSI
    const totalCoils = Math.max(2, Math.min(8, Math.round(rsi * 2)));
    const totalPoints = totalCoils * 60;
    const maxRadius = size / 2 - 20;

    // Generate Archimedean spiral points
    const spiralPoints: [number, number][] = [];
    for (let i = 0; i <= totalPoints; i++) {
      const t = i / totalPoints;
      const angle = t * totalCoils * 2 * Math.PI;
      const radius = maxRadius * (1 - t); // spiral inward
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      spiralPoints.push([x, y]);
    }

    // Draw spiral path
    const line = d3.line<[number, number]>()
      .x(d => d[0])
      .y(d => d[1])
      .curve(d3.curveBasisOpen);

    const spiralPath = svg.append("path")
      .datum(spiralPoints)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "#4a4946")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0);

    spiralPath.transition().delay(400).duration(800).attr("opacity", 0.4);

    // Place dots along the spiral representing attempt clusters
    const dotCount = Math.min(stats.retryClusters, 30);
    const dotSpacing = Math.floor(totalPoints / Math.max(dotCount, 1));

    const colorScale = d3.scaleSequential(
      d3.interpolateRgbBasis(["#4a4946", "#ff6b35", "#ffdbd0"])
    ).domain([0, dotCount - 1]);

    for (let i = 0; i < dotCount; i++) {
      const idx = Math.min(i * dotSpacing, spiralPoints.length - 1);
      const [x, y] = spiralPoints[idx];
      const isLast = i === dotCount - 1;
      const dotRadius = isLast ? 6 : 3;

      svg.append("circle")
        .attr("cx", x).attr("cy", y)
        .attr("r", 0)
        .attr("fill", colorScale(i))
        .attr("opacity", 0)
        .transition()
        .delay(600 + i * 40)
        .duration(300)
        .attr("r", dotRadius)
        .attr("opacity", isLast ? 1 : 0.7);

      // Glow on the final dot
      if (isLast) {
        svg.append("circle")
          .attr("cx", x).attr("cy", y)
          .attr("r", 0)
          .attr("fill", "none")
          .attr("stroke", "#ff6b35")
          .attr("stroke-width", 2)
          .attr("opacity", 0)
          .transition()
          .delay(600 + i * 40 + 200)
          .duration(600)
          .attr("r", 14)
          .attr("opacity", 0.4)
          .transition()
          .duration(1000)
          .attr("r", 20)
          .attr("opacity", 0);
      }
    }

    // Center label
    svg.append("text")
      .attr("x", cx).attr("y", cy - 8)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#ff6b35")
      .attr("font-size", "28px")
      .attr("font-family", "Plus Jakarta Sans")
      .attr("font-weight", "800")
      .attr("opacity", 0)
      .text(rsi.toFixed(1))
      .transition().delay(1200).duration(500).attr("opacity", 1);

    svg.append("text")
      .attr("x", cx).attr("y", cy + 14)
      .attr("text-anchor", "middle")
      .attr("fill", "#97908a")
      .attr("font-size", "8px")
      .attr("font-family", "Plus Jakarta Sans")
      .attr("font-weight", "700")
      .attr("letter-spacing", "0.15em")
      .attr("opacity", 0)
      .text("RSI")
      .transition().delay(1300).duration(500).attr("opacity", 1);
  }, [stats]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 md:px-6 py-12 md:py-20 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-2 mb-4">
        <span className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Retry Spiral</span>
        <h2 className="font-headline text-4xl md:text-7xl font-extrabold tracking-tight text-center text-glow">{narrative.archetypeLabel}</h2>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
        className="font-body text-lg md:text-xl italic text-on-surface-variant text-center max-w-md mb-6">{narrative.story}</motion.p>

      {/* GIF Mascot Placeholder */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="w-32 h-32 md:w-44 md:h-44 rounded-2xl overflow-hidden mb-4 md:mb-6">
        <video src="/mascots/videos/retry-spiral.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xs">
        <svg ref={svgRef} className="w-full h-auto" />
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
        className="mt-6 flex items-center gap-6">
        <div className="text-center">
          <span className="font-headline text-2xl font-extrabold text-primary">{stats.retryClusters}</span>
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface/40 ml-1">Clusters</span>
        </div>
        <div className="h-6 w-px bg-on-surface/10" />
        <div className="text-center">
          <span className="font-headline text-2xl font-extrabold text-primary-fixed-dim">{stats.totalRetries}</span>
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface/40 ml-1">Attempts</span>
        </div>
      </motion.div>
    </div>
  );
}
