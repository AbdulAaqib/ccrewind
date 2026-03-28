"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import { ComputedStats } from "@/types";
import { getGraveyardShiftNarrative } from "@/lib/narratives";

export default function GraveyardShift({ stats }: { stats: ComputedStats }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const narrative = getGraveyardShiftNarrative(stats);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 360, height = 360;
    const radius = Math.min(width, height) / 2 - 36;
    const innerRadius = radius * 0.3;

    const g = svg.attr("viewBox", `0 0 ${width} ${height}`)
      .append("g").attr("transform", `translate(${width / 2},${height / 2})`);

    const maxVal = Math.max(...stats.hourDistribution, 1);
    const colorScale = d3.scaleSequential(
      d3.interpolateRgbBasis(["#2f2f2d", "#ff6b35", "#ffdbd0"])
    ).domain([0, maxVal]);
    const radiusScale = d3.scaleLinear().domain([0, maxVal]).range([innerRadius, radius]);
    const arc = d3.arc<d3.DefaultArcObject>();

    stats.hourDistribution.forEach((value, i) => {
      const startAngle = (i / 24) * Math.PI * 2 - Math.PI / 2;
      const endAngle = ((i + 1) / 24) * Math.PI * 2 - Math.PI / 2;
      const outerR = radiusScale(value);

      g.append("path")
        .attr("d", arc({ innerRadius, outerRadius: innerRadius, startAngle, endAngle }) as string)
        .attr("fill", colorScale(value))
        .attr("stroke", "#262624").attr("stroke-width", 1)
        .transition().delay(i * 60).duration(600).ease(d3.easeCubicOut)
        .attrTween("d", () => {
          const interp = d3.interpolate(innerRadius, outerR);
          return (t: number) => arc({ innerRadius, outerRadius: interp(t), startAngle, endAngle }) as string;
        });
    });

    const labels: Record<number, string> = { 0: "12am", 6: "6am", 12: "12pm", 18: "6pm" };
    [0, 6, 12, 18].forEach((hour) => {
      const angle = (hour / 24) * Math.PI * 2 - Math.PI / 2;
      const r = radius + 14;
      g.append("text")
        .attr("x", Math.cos(angle) * r).attr("y", Math.sin(angle) * r)
        .attr("text-anchor", "middle").attr("dominant-baseline", "middle")
        .attr("fill", "#97908a").attr("font-size", "10px").attr("font-family", "Plus Jakarta Sans")
        .text(labels[hour]);
    });

    g.append("text").attr("text-anchor", "middle").attr("dominant-baseline", "middle")
      .attr("fill", "#faf9f5").attr("font-size", "12px")
      .attr("font-family", "Plus Jakarta Sans").attr("font-weight", "700").text("24h");
  }, [stats]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 md:px-6 py-12 md:py-20 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-2 mb-4">
        <span className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-primary">When You Code</span>
        <h2 className="font-headline text-4xl md:text-7xl font-extrabold tracking-tight text-center text-glow">{narrative.archetypeLabel}</h2>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
        className="font-body text-lg md:text-xl italic text-on-surface-variant text-center max-w-md mb-6">{narrative.story}</motion.p>
      {/* GIF Mascot Placeholder */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="w-32 h-32 md:w-44 md:h-44 rounded-2xl overflow-hidden mb-4 md:mb-6">
        <img src="/mascots/graveyard-shift.png" alt="Night coding mascot" className="w-full h-full object-cover" />
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <svg ref={svgRef} className="w-56 h-56 md:w-80 md:h-80" />
      </motion.div>
    </div>
  );
}
