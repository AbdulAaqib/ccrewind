"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import { ComputedStats } from "@/types";

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function fmtDuration(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatHour(hour: number): string {
  if (hour === 0) return "12am";
  if (hour === 12) return "12pm";
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

// Stat card component
function StatCell({ label, value, sub, delay }: { label: string; value: string; sub?: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex flex-col items-center justify-center p-2 md:p-3"
    >
      <span className="font-label text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-on-surface/40 mb-1">
        {label}
      </span>
      <span className="font-headline text-xl md:text-2xl font-extrabold text-on-surface">{value}</span>
      {sub && <span className="font-body text-[9px] md:text-[10px] text-on-surface/30 mt-0.5">{sub}</span>}
    </motion.div>
  );
}

// Mini sparkline for 24h distribution
function HourSparkline({ data }: { data: number[] }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const W = 180,
      H = 40;
    svg.attr("viewBox", `0 0 ${W} ${H}`);
    const max = Math.max(...data, 1);
    const barW = W / 24 - 1;
    data.forEach((v, i) => {
      const h = (v / max) * (H - 4);
      svg
        .append("rect")
        .attr("x", i * (barW + 1))
        .attr("y", H - h)
        .attr("width", barW)
        .attr("height", h)
        .attr("rx", 1)
        .attr("fill", v === Math.max(...data) ? "#ff6b35" : "#4a4946");
    });
  }, [data]);
  return <svg ref={ref} className="w-full h-8 md:h-10" />;
}

// Mini horizontal bars for tools
function ToolBars({ tools }: { tools: Array<{ name: string; count: number }> }) {
  const top = tools.slice(0, 4);
  const max = Math.max(top[0]?.count ?? 1, 1);
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {top.map((t) => (
        <div key={t.name} className="flex items-center gap-2">
          <span className="font-label text-[8px] md:text-[9px] uppercase tracking-wider text-on-surface/40 w-10 md:w-12 text-right shrink-0">
            {t.name}
          </span>
          <div className="flex-1 h-3 md:h-3.5 bg-[#2f2f2d] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(t.count / max) * 100}%` }}
              transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: t === top[0] ? "#ff6b35" : "#ffb59d" }}
            />
          </div>
          <span className="font-label text-[8px] md:text-[9px] text-on-surface/30 w-8 md:w-10 shrink-0">
            {fmt(t.count)}
          </span>
        </div>
      ))}
    </div>
  );
}

// Mini model bars
function ModelBars({ counts }: { counts: Record<string, number> }) {
  const entries = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const total = entries.reduce((a, b) => a + b[1], 0);
  const colors = ["#ff6b35", "#ffb59d", "#ffdbd0"];
  return (
    <div className="flex gap-0.5 w-full h-4 md:h-5 rounded-full overflow-hidden">
      {entries.map((e, i) => (
        <motion.div
          key={e[0]}
          initial={{ width: 0 }}
          animate={{ width: `${(e[1] / total) * 100}%` }}
          transition={{ delay: 1, duration: 0.6 }}
          className="h-full"
          style={{ backgroundColor: colors[i] }}
          title={`${e[0].replace("claude-", "").replace(/-\d{8,}$/, "")} — ${Math.round((e[1] / total) * 100)}%`}
        />
      ))}
    </div>
  );
}

// Activity heatmap row
function ActivityRow({ data }: { data: Array<{ date: string; messageCount: number }> }) {
  const recent = data.slice(-28);
  const max = Math.max(...recent.map((d) => d.messageCount), 1);
  return (
    <div className="flex gap-[2px]">
      {recent.map((d, i) => {
        const intensity = d.messageCount / max;
        const color = intensity === 0 ? "#2f2f2d" : `rgba(255,107,53,${0.2 + intensity * 0.8})`;
        return (
          <div
            key={i}
            className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-[2px]"
            style={{ backgroundColor: color }}
            title={`${d.date}: ${d.messageCount} msgs`}
          />
        );
      })}
    </div>
  );
}

export default function Dashboard({ stats }: { stats: ComputedStats }) {
  const toolUseCount = stats.stopReasonCounts["tool_use"] ?? 0;
  const endTurnCount = stats.stopReasonCounts["end_turn"] ?? 0;
  const stopTotal = toolUseCount + endTurnCount;

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-4 md:px-8 py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mb-3 md:mb-4 text-center"
      >
        <span className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight text-on-surface">
          Your Dashboard
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-4xl bg-[#1e1e1c] rounded-2xl border border-[#3d3d3a]/50 overflow-hidden"
      >
        {/* Row 1: Hero Stats */}
        <div className="grid grid-cols-4 divide-x divide-[#3d3d3a]/30 border-b border-[#3d3d3a]/30">
          <StatCell label="Messages" value={fmt(stats.totalMessages)} delay={0.3} />
          <StatCell label="Sessions" value={fmt(stats.totalSessions)} delay={0.35} />
          <StatCell label="Tokens" value={fmt(stats.totalTokens)} delay={0.4} />
          <StatCell
            label="Days"
            value={stats.totalActiveDays.toString()}
            sub={`${stats.longestStreak}d streak`}
            delay={0.45}
          />
        </div>

        {/* Row 2: Activity + Tools */}
        <div className="grid grid-cols-2 divide-x divide-[#3d3d3a]/30 border-b border-[#3d3d3a]/30">
          {/* 24h Activity */}
          <div className="p-3 md:p-4">
            <span className="font-label text-[8px] md:text-[9px] uppercase tracking-[0.15em] text-on-surface/40 block mb-2">
              24h Activity
            </span>
            <HourSparkline data={stats.hourDistribution} />
            <div className="flex justify-between mt-1">
              <span className="font-label text-[7px] md:text-[8px] text-on-surface/25">12am</span>
              <span className="font-label text-[7px] md:text-[8px] text-primary">
                peak {formatHour(stats.peakHour)}
              </span>
              <span className="font-label text-[7px] md:text-[8px] text-on-surface/25">11pm</span>
            </div>
          </div>
          {/* Top Tools */}
          <div className="p-3 md:p-4">
            <span className="font-label text-[8px] md:text-[9px] uppercase tracking-[0.15em] text-on-surface/40 block mb-2">
              Top Tools
            </span>
            <ToolBars tools={stats.topTools} />
          </div>
        </div>

        {/* Row 3: Models + Stats Grid */}
        <div className="grid grid-cols-2 divide-x divide-[#3d3d3a]/30 border-b border-[#3d3d3a]/30">
          {/* Models */}
          <div className="p-3 md:p-4">
            <span className="font-label text-[8px] md:text-[9px] uppercase tracking-[0.15em] text-on-surface/40 block mb-2">
              Model Usage
            </span>
            <ModelBars counts={stats.modelCounts} />
            <div className="flex gap-2 mt-2 flex-wrap">
              {Object.entries(stats.modelCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map((e, i) => {
                  const colors = ["#ff6b35", "#ffb59d", "#ffdbd0"];
                  const name = e[0].replace("claude-", "").replace(/-\d{8,}$/, "");
                  const total = Object.values(stats.modelCounts).reduce((a, b) => a + b, 0);
                  return (
                    <div key={e[0]} className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[i] }} />
                      <span className="font-label text-[7px] md:text-[8px] text-on-surface/40">
                        {name} {Math.round((e[1] / total) * 100)}%
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
          {/* Quick Stats */}
          <div className="p-3 md:p-4 grid grid-cols-2 gap-y-2 gap-x-3">
            <div>
              <span className="font-label text-[7px] md:text-[8px] uppercase tracking-wider text-on-surface/30 block">
                Projects
              </span>
              <span className="font-headline text-sm md:text-base font-extrabold text-on-surface">
                {stats.projectCount}
              </span>
            </div>
            <div>
              <span className="font-label text-[7px] md:text-[8px] uppercase tracking-wider text-on-surface/30 block">
                Branches
              </span>
              <span className="font-headline text-sm md:text-base font-extrabold text-on-surface">
                {stats.branchCount}
              </span>
            </div>
            <div>
              <span className="font-label text-[7px] md:text-[8px] uppercase tracking-wider text-on-surface/30 block">
                Thinking
              </span>
              <span className="font-headline text-sm md:text-base font-extrabold text-on-surface">
                {fmtDuration(stats.estimatedThinkingTimeMs)}
              </span>
            </div>
            <div>
              <span className="font-label text-[7px] md:text-[8px] uppercase tracking-wider text-on-surface/30 block">
                Tool Calls
              </span>
              <span className="font-headline text-sm md:text-base font-extrabold text-on-surface">
                {fmt(stats.totalToolCalls)}
              </span>
            </div>
          </div>
        </div>

        {/* Row 4: Heatmap + Bottom Stats */}
        <div className="grid grid-cols-2 divide-x divide-[#3d3d3a]/30">
          {/* Activity Heatmap */}
          <div className="p-3 md:p-4">
            <span className="font-label text-[8px] md:text-[9px] uppercase tracking-[0.15em] text-on-surface/40 block mb-2">
              Last 28 Days
            </span>
            <ActivityRow data={stats.dailyActivity} />
          </div>
          {/* More stats */}
          <div className="p-3 md:p-4 grid grid-cols-2 gap-y-2 gap-x-3">
            <div>
              <span className="font-label text-[7px] md:text-[8px] uppercase tracking-wider text-on-surface/30 block">
                Avg Prompt
              </span>
              <span className="font-headline text-sm md:text-base font-extrabold text-on-surface">
                {Math.round(stats.avgPromptLength)}
                <span className="text-[9px] text-on-surface/30 ml-0.5">chars</span>
              </span>
            </div>
            <div>
              <span className="font-label text-[7px] md:text-[8px] uppercase tracking-wider text-on-surface/30 block">
                Msgs/Session
              </span>
              <span className="font-headline text-sm md:text-base font-extrabold text-on-surface">
                {stats.avgMessagesPerSession.toFixed(1)}
              </span>
            </div>
            <div>
              <span className="font-label text-[7px] md:text-[8px] uppercase tracking-wider text-on-surface/30 block">
                Agents
              </span>
              <span className="font-headline text-sm md:text-base font-extrabold text-on-surface">
                {stats.agentToolCalls}
              </span>
            </div>
            <div>
              <span className="font-label text-[7px] md:text-[8px] uppercase tracking-wider text-on-surface/30 block">
                Stop: Tool
              </span>
              <span className="font-headline text-sm md:text-base font-extrabold text-on-surface">
                {stopTotal > 0 ? Math.round((toolUseCount / stopTotal) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Row 5: Top Projects */}
        <div className="border-t border-[#3d3d3a]/30 p-3 md:p-4">
          <span className="font-label text-[8px] md:text-[9px] uppercase tracking-[0.15em] text-on-surface/40 block mb-2">
            Top Projects
          </span>
          <div className="flex flex-col gap-1.5">
            {stats.topProjectStats.slice(0, 3).map((proj, i) => {
              const name = proj.name.split("/").pop() || proj.name;
              const max = stats.topProjectStats[0]?.messages || 1;
              const colors = ["#ff6b35", "#ffb59d", "#ffdbd0"];
              return (
                <div key={proj.name} className="flex items-center gap-2">
                  <span className="font-label text-[8px] md:text-[9px] text-on-surface/40 w-16 md:w-20 text-right shrink-0 truncate">
                    {name}
                  </span>
                  <div className="flex-1 h-3 md:h-3.5 bg-[#2f2f2d] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(proj.messages / max) * 100}%` }}
                      transition={{ delay: 1.6 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: colors[i] }}
                    />
                  </div>
                  <span className="font-label text-[8px] md:text-[9px] text-on-surface/30 w-10 shrink-0">
                    {fmt(proj.messages)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 6: Token breakdown bar */}
        <div className="border-t border-[#3d3d3a]/30 p-3 md:p-4">
          <span className="font-label text-[8px] md:text-[9px] uppercase tracking-[0.15em] text-on-surface/40 block mb-2">
            Token Breakdown
          </span>
          <div className="flex gap-0.5 w-full h-5 md:h-6 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.totalInputTokens / stats.totalTokens) * 100}%` }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="h-full bg-[#ff6b35]"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.totalOutputTokens / stats.totalTokens) * 100}%` }}
              transition={{ delay: 1.3, duration: 0.6 }}
              className="h-full bg-[#ffb59d]"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.totalCacheReadTokens / stats.totalTokens) * 100}%` }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="h-full bg-[#ffdbd0]"
            />
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]" />
              <span className="font-label text-[7px] md:text-[8px] text-on-surface/40">
                Input {fmt(stats.totalInputTokens)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ffb59d]" />
              <span className="font-label text-[7px] md:text-[8px] text-on-surface/40">
                Output {fmt(stats.totalOutputTokens)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ffdbd0]" />
              <span className="font-label text-[7px] md:text-[8px] text-on-surface/40">
                Cache {fmt(stats.totalCacheReadTokens)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
