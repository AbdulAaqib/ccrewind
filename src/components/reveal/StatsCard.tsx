"use client";

import { ComputedStats } from "@/types";

interface Props {
  stats: ComputedStats;
  variant: 1 | 2 | 3 | 4 | 5;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function fmtCost(n: number): string {
  return n >= 1 ? `$${n.toFixed(0)}` : `$${n.toFixed(2)}`;
}

function fmtHour(h: number): string {
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

function cleanModel(m: string): string {
  return m.replace("claude-", "").replace(/-\d{8,}$/, "");
}

// ─── Variant 1: Dev Terminal ──────────────────────────────────
function V1({ stats }: { stats: ComputedStats }) {
  const msgsPerSession = Math.round(stats.avgMessagesPerSession);

  return (
    <div className="w-full h-full flex flex-col justify-between px-6 py-7 md:px-8 md:py-9 relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#faf9f5 1px, transparent 1px), linear-gradient(90deg, #faf9f5 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div>
          <span className="font-label text-[10px] font-extrabold tracking-[0.2em] uppercase text-primary whitespace-nowrap">
            Claude Code Rewind
          </span>
          <p className="font-label text-[8px] tracking-[0.25em] uppercase text-on-surface/25 whitespace-nowrap mt-0.5">
            Dev Stats
          </p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-label text-[8px] uppercase tracking-wider text-on-surface/20">peak</span>
          <span className="font-headline text-sm font-extrabold text-primary">{fmtHour(stats.peakHour)}</span>
        </div>
      </div>

      {/* Hero — tokens */}
      <div className="relative flex flex-col gap-0.5 border-l-2 border-primary/60 pl-4 my-1">
        <span className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface/30 whitespace-nowrap">
          tokens burned
        </span>
        <span className="font-headline text-5xl md:text-6xl font-extrabold text-primary leading-none">
          {fmt(stats.totalTokens)}
        </span>
        <div className="flex gap-2 items-center mt-1">
          <span className="font-label text-[8px] text-on-surface/30">{fmt(stats.totalInputTokens)} in</span>
          <span className="text-on-surface/15 text-[8px]">·</span>
          <span className="font-label text-[8px] text-on-surface/30">{fmt(stats.totalOutputTokens)} out</span>
          <span className="text-on-surface/15 text-[8px]">·</span>
          <span className="font-label text-[8px] text-on-surface/30">
            {fmt(stats.totalCacheReadTokens + stats.totalCacheCreationTokens)} cache
          </span>
        </div>
      </div>

      {/* Messages block */}
      <div className="relative flex flex-col gap-1">
        <span className="font-label text-[8px] uppercase tracking-[0.2em] text-on-surface/25 whitespace-nowrap">
          messages sent
        </span>
        <span className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface leading-none">
          {fmt(stats.totalMessages)}
        </span>
      </div>

      {/* Stat row */}
      <div className="relative grid grid-cols-3 gap-2 border-t border-on-surface/8 pt-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-label text-[8px] uppercase tracking-wider text-on-surface/25">cost</span>
          <span className="font-headline text-xl font-extrabold text-on-surface">
            {fmtCost(stats.estimatedCostUSD)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-label text-[8px] uppercase tracking-wider text-on-surface/25">sessions</span>
          <span className="font-headline text-xl font-extrabold text-on-surface">{stats.totalSessions}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-label text-[8px] uppercase tracking-wider text-on-surface/25">msg/session</span>
          <span className="font-headline text-xl font-extrabold text-on-surface">{msgsPerSession}</span>
        </div>
      </div>

      {/* Model + streak footer */}
      <div className="relative flex items-center justify-between border-t border-on-surface/8 pt-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-label text-[8px] uppercase tracking-wider text-on-surface/25">primary model</span>
          <span className="font-label text-xs font-bold text-on-surface/70">{cleanModel(stats.primaryModel)}</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-label text-[8px] uppercase tracking-wider text-on-surface/25">streak</span>
          <span className="font-label text-xs font-bold text-on-surface/70">{stats.longestStreak}d</span>
        </div>
      </div>
    </div>
  );
}

// ─── Variant 2: Receipt ───────────────────────────────────────
function V2({ stats }: { stats: ComputedStats }) {
  const top = stats.topProjectStats[0];
  const rows = [
    { label: "Messages", value: fmt(stats.totalMessages) },
    { label: "Sessions", value: stats.totalSessions.toString() },
    { label: "Projects", value: stats.projectCount.toString() },
    { label: "Peak Hour", value: fmtHour(stats.peakHour) },
    { label: "Streak", value: `${stats.longestStreak} days` },
    { label: "Model", value: cleanModel(stats.primaryModel) },
    { label: "Est. Cost", value: fmtCost(stats.estimatedCostUSD) },
    { label: "Tokens", value: fmt(stats.totalTokens) },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-between px-6 py-8 md:px-8 md:py-10">
      <div className="flex flex-col items-center gap-1">
        <span className="font-label text-[10px] font-extrabold tracking-[0.2em] uppercase text-primary whitespace-nowrap">
          Claude Code Rewind
        </span>
        <span className="font-label text-[9px] tracking-[0.3em] uppercase text-on-surface/30 whitespace-nowrap">
          Your Receipt
        </span>
      </div>

      <div className="flex flex-col gap-0 flex-1 justify-center w-full max-w-[260px]">
        <div className="border-t border-dashed border-on-surface/15 mb-4" />
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between items-baseline py-2">
            <span className="font-label text-xs uppercase tracking-[0.1em] text-on-surface/40">{row.label}</span>
            <span className="font-headline text-lg font-extrabold text-on-surface">{row.value}</span>
          </div>
        ))}
        <div className="border-t border-dashed border-on-surface/15 mt-4" />

        {top && (
          <div className="flex justify-between items-baseline py-3">
            <span className="font-label text-[10px] uppercase tracking-[0.1em] text-on-surface/30">Top Project</span>
            <span className="font-label text-xs font-bold text-primary">{top.name.split("/").pop()}</span>
          </div>
        )}
      </div>

      <p className="font-body text-[10px] italic text-on-surface/20">No refunds.</p>
    </div>
  );
}

// ─── Variant 3: Big Tokens + Row ─────────────────────────────
function V3({ stats }: { stats: ComputedStats }) {
  const totalTokens = stats.totalTokens;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between px-6 py-8 md:px-8 md:py-10">
      <div className="flex flex-col items-center gap-1">
        <span className="font-label text-[10px] font-extrabold tracking-[0.2em] uppercase text-primary whitespace-nowrap">
          Claude Code Rewind
        </span>
        <span className="font-label text-[9px] tracking-[0.3em] uppercase text-on-surface/30 whitespace-nowrap">
          Token Report
        </span>
      </div>

      <div className="flex flex-col items-center gap-8 flex-1 justify-center">
        {/* Hero: total tokens */}
        <div className="text-center">
          <span className="font-headline text-5xl md:text-6xl font-extrabold text-primary">{fmt(totalTokens)}</span>
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/40 mt-1 whitespace-nowrap">
            total tokens
          </p>
        </div>

        {/* Token breakdown 2x2 */}
        <div className="grid grid-cols-2 gap-x-10 gap-y-4">
          <div className="text-center">
            <span className="font-headline text-xl font-extrabold text-on-surface">{fmt(stats.totalInputTokens)}</span>
            <p className="font-label text-[8px] uppercase tracking-[0.1em] text-on-surface/30">input</p>
          </div>
          <div className="text-center">
            <span className="font-headline text-xl font-extrabold text-on-surface">{fmt(stats.totalOutputTokens)}</span>
            <p className="font-label text-[8px] uppercase tracking-[0.1em] text-on-surface/30">output</p>
          </div>
          <div className="text-center">
            <span className="font-headline text-xl font-extrabold text-on-surface">
              {fmt(stats.totalCacheReadTokens)}
            </span>
            <p className="font-label text-[8px] uppercase tracking-[0.1em] text-on-surface/30">cache read</p>
          </div>
          <div className="text-center">
            <span className="font-headline text-xl font-extrabold text-on-surface">
              {fmt(stats.totalCacheCreationTokens)}
            </span>
            <p className="font-label text-[8px] uppercase tracking-[0.1em] text-on-surface/30">cache write</p>
          </div>
        </div>

        {/* Key stats row */}
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {[`${stats.totalSessions} sessions`, fmtCost(stats.estimatedCostUSD), cleanModel(stats.primaryModel)].map(
            (pill) => (
              <span
                key={pill}
                className="bg-surface-container-high/80 border border-on-surface/5 rounded-full px-3 py-1 font-label text-[9px] font-bold uppercase tracking-wider text-on-surface/40"
              >
                {pill}
              </span>
            )
          )}
        </div>
      </div>

      <p className="font-label text-[10px] text-on-surface/20">{cleanModel(stats.primaryModel)} main</p>
    </div>
  );
}

// ─── Variant 4: Top Projects Focus ───────────────────────────
function V4({ stats }: { stats: ComputedStats }) {
  const top3 = stats.topProjectStats.slice(0, 3);
  const maxMsgs = top3[0]?.messages || 1;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between px-6 py-8 md:px-8 md:py-10">
      <div className="flex flex-col items-center gap-1">
        <span className="font-label text-[10px] font-extrabold tracking-[0.2em] uppercase text-primary whitespace-nowrap">
          Claude Code Rewind
        </span>
        <span className="font-label text-[9px] tracking-[0.3em] uppercase text-on-surface/30 whitespace-nowrap">
          Top Projects
        </span>
      </div>

      <div className="flex flex-col gap-6 flex-1 justify-center w-full max-w-[280px]">
        {top3.map((p, i) => {
          const barW = (p.messages / maxMsgs) * 100;
          const colors = ["#ff6b35", "#ffb59d", "#97908a"];
          const medals = ["1st", "2nd", "3rd"];
          return (
            <div key={p.name} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-baseline">
                <span className="font-label text-xs font-bold text-on-surface/60 truncate max-w-[180px]">
                  {medals[i]} — {p.name.split("/").pop()}
                </span>
                <span className="font-label text-[10px] text-on-surface/30">{fmt(p.messages)} msgs</span>
              </div>
              <div className="w-full h-3 bg-surface-container-high/60 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${barW}%`, backgroundColor: colors[i] }} />
              </div>
            </div>
          );
        })}

        {/* Summary stats */}
        <div className="border-t border-on-surface/10 pt-4 mt-2">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <span className="font-headline text-lg font-extrabold text-on-surface">{stats.projectCount}</span>
              <p className="font-label text-[8px] uppercase tracking-[0.1em] text-on-surface/30">total</p>
            </div>
            <div>
              <span className="font-headline text-lg font-extrabold text-primary">{fmtHour(stats.peakHour)}</span>
              <p className="font-label text-[8px] uppercase tracking-[0.1em] text-on-surface/30">peak</p>
            </div>
            <div>
              <span className="font-headline text-lg font-extrabold text-on-surface">
                {fmtCost(stats.estimatedCostUSD)}
              </span>
              <p className="font-label text-[8px] uppercase tracking-[0.1em] text-on-surface/30">cost</p>
            </div>
          </div>
        </div>
      </div>

      <p className="font-body text-[10px] italic text-on-surface/20">
        {stats.daysActive} days active · {cleanModel(stats.primaryModel)}
      </p>
    </div>
  );
}

// ─── Variant 5: Prose Card ────────────────────────────────────
function V5({ stats }: { stats: ComputedStats }) {
  const top = stats.topProjectStats[0];
  const totalTokens = stats.totalInputTokens + stats.totalOutputTokens;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between px-8 py-8 md:px-10 md:py-10">
      <div className="flex flex-col items-center gap-1">
        <span className="font-label text-[10px] font-extrabold tracking-[0.2em] uppercase text-primary whitespace-nowrap">
          Claude Code Rewind
        </span>
      </div>

      <div className="flex flex-col items-center gap-6 flex-1 justify-center max-w-[260px]">
        <p className="font-body text-lg md:text-xl leading-relaxed text-on-surface/80 text-center">
          You sent <span className="font-extrabold text-on-surface">{fmt(stats.totalMessages)}</span> messages across{" "}
          <span className="font-extrabold text-on-surface">{stats.projectCount}</span> projects in{" "}
          <span className="font-extrabold text-on-surface">{stats.totalSessions}</span> sessions.
        </p>

        <p className="font-body text-lg md:text-xl leading-relaxed text-on-surface/80 text-center">
          Peaked at <span className="font-extrabold text-primary">{fmtHour(stats.peakHour)}</span>. Burned{" "}
          <span className="font-extrabold text-on-surface">{fmt(totalTokens)}</span> tokens.{" "}
          <span className="font-extrabold text-on-surface">{stats.longestStreak}</span>-day streak.
        </p>

        <p className="font-body text-lg md:text-xl leading-relaxed text-on-surface/80 text-center">
          <span className="font-extrabold text-primary">{fmtCost(stats.estimatedCostUSD)}</span> estimated. All on{" "}
          <span className="font-extrabold text-on-surface">{cleanModel(stats.primaryModel)}</span>.
        </p>
      </div>

      {top && <p className="font-body text-[10px] italic text-on-surface/20">Most used: {top.name.split("/").pop()}</p>}
    </div>
  );
}

const VARIANTS = { 1: V1, 2: V2, 3: V3, 4: V4, 5: V5 };

export default function StatsCard({ stats, variant }: Props) {
  const Variant = VARIANTS[variant];

  return (
    <div
      className="w-full rounded-3xl overflow-hidden border border-on-surface/10 bg-surface-dim"
      style={{ aspectRatio: "2 / 3" }}
    >
      <Variant stats={stats} />
    </div>
  );
}
