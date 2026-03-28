"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import { ComputedStats } from "@/types";
import { getSharpshooterNarrative } from "@/lib/narratives";

export default function Sharpshooter({ stats }: { stats: ComputedStats }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const narrative = getSharpshooterNarrative(stats);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 340,
      height = 340;
    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    svg.attr("viewBox", `0 0 ${width} ${height}`);
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const maxPL = Math.max(stats.avgPromptLength * 2, 300);
    const maxMPS = Math.max(stats.avgMessagesPerSession * 2, 40);
    const xScale = d3.scaleLinear().domain([0, maxPL]).range([0, innerW]);
    const yScale = d3.scaleLinear().domain([0, maxMPS]).range([innerH, 0]);
    const midX = maxPL / 2,
      midY = maxMPS / 2;

    // Quadrant labels
    const ql = [
      { label: "Sniper", x: 10, y: innerH - 10, anchor: "start" },
      { label: "Over-Preparer", x: innerW - 10, y: innerH - 10, anchor: "end" },
      { label: "Rambler", x: 10, y: 16, anchor: "start" },
      { label: "Novelist", x: innerW - 10, y: 16, anchor: "end" },
    ];
    ql.forEach((q) => {
      g.append("text")
        .attr("x", q.x)
        .attr("y", q.y)
        .attr("text-anchor", q.anchor)
        .attr("fill", "#4a4946")
        .attr("font-size", "10px")
        .attr("font-family", "Plus Jakarta Sans")
        .attr("font-weight", "700")
        .text(q.label);
    });

    // Grid
    g.append("line")
      .attr("x1", xScale(midX))
      .attr("y1", 0)
      .attr("x2", xScale(midX))
      .attr("y2", innerH)
      .attr("stroke", "#3d3d3a")
      .attr("stroke-dasharray", "4,4");
    g.append("line")
      .attr("x1", 0)
      .attr("y1", yScale(midY))
      .attr("x2", innerW)
      .attr("y2", yScale(midY))
      .attr("stroke", "#3d3d3a")
      .attr("stroke-dasharray", "4,4");

    // Axis labels
    g.append("text")
      .attr("x", innerW / 2)
      .attr("y", innerH + 35)
      .attr("text-anchor", "middle")
      .attr("fill", "#97908a")
      .attr("font-size", "9px")
      .attr("font-family", "Plus Jakarta Sans")
      .text("Avg Prompt Length →");
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerH / 2)
      .attr("y", -35)
      .attr("text-anchor", "middle")
      .attr("fill", "#97908a")
      .attr("font-size", "9px")
      .attr("font-family", "Plus Jakarta Sans")
      .text("Messages / Session →");

    const dotX = xScale(Math.min(stats.avgPromptLength, maxPL));
    const dotY = yScale(Math.min(stats.avgMessagesPerSession, maxMPS));

    // Crosshair — zooms in slowly on target
    const crosshairR = 22;
    const ch = g.append("g").attr("opacity", 0);

    ch.append("circle")
      .attr("cx", dotX)
      .attr("cy", dotY)
      .attr("r", crosshairR)
      .attr("fill", "none")
      .attr("stroke", "#ff6b35")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.6);
    [
      [-crosshairR - 6, 0],
      [crosshairR + 6, 0],
      [0, -crosshairR - 6],
      [0, crosshairR + 6],
    ].forEach(([dx, dy]) => {
      ch.append("line")
        .attr("x1", dotX + dx * 0.4)
        .attr("y1", dotY + dy * 0.4)
        .attr("x2", dotX + dx)
        .attr("y2", dotY + dy)
        .attr("stroke", "#ff6b35")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.6);
    });

    ch.transition()
      .delay(600)
      .duration(400)
      .attr("opacity", 1)
      .on("end", () => {
        // brief pause then BANG
        setTimeout(() => {
          // crosshair disappears instantly
          ch.attr("opacity", 0);

          // flash — white burst
          g.append("circle")
            .attr("cx", dotX)
            .attr("cy", dotY)
            .attr("r", 4)
            .attr("fill", "white")
            .attr("opacity", 1)
            .transition()
            .duration(120)
            .ease(d3.easeCubicOut)
            .attr("r", 40)
            .attr("opacity", 0)
            .remove();

          // dot appears instantly
          g.append("circle")
            .attr("cx", dotX)
            .attr("cy", dotY)
            .attr("r", 8)
            .attr("fill", "#ff6b35")
            .attr("stroke", "white")
            .attr("stroke-width", 2)
            .attr("opacity", 1);

          // shockwave rings
          [0, 1, 2, 3].forEach((i) => {
            g.append("circle")
              .attr("cx", dotX)
              .attr("cy", dotY)
              .attr("r", 8)
              .attr("fill", "none")
              .attr("stroke", "#ff6b35")
              .attr("stroke-width", 3 - i * 0.6)
              .attr("opacity", 0.9 - i * 0.15)
              .transition()
              .delay(i * 50)
              .duration(600)
              .ease(d3.easeCubicOut)
              .attr("r", 16 + i * 18)
              .attr("opacity", 0)
              .remove();
          });

          // label
          g.append("text")
            .attr("x", dotX)
            .attr("y", dotY - 16)
            .attr("text-anchor", "middle")
            .attr("fill", "#faf9f5")
            .attr("font-size", "11px")
            .attr("font-family", "Plus Jakarta Sans")
            .attr("font-weight", "700")
            .attr("opacity", 0)
            .text("You")
            .transition()
            .delay(300)
            .duration(400)
            .attr("opacity", 1);
        }, 400);
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
        <span className="font-label text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Prompt Style</span>
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
          src="/mascots/videos/sharpshooter.mp4"
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
        <svg ref={svgRef} className="w-56 h-56 md:w-80 md:h-80" />
      </motion.div>
    </div>
  );
}
