import { ComputedStats } from "@/types";

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatHour(hour: number): string {
  if (hour === 0) return "midnight";
  if (hour === 12) return "noon";
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export interface SlideNarrative {
  archetypeLabel: string;
  story: string;
  stat: string;
  statLabel: string;
}

export function getGraveyardShiftNarrative(stats: ComputedStats): SlideNarrative {
  const { peakHour } = stats;
  const isNight = peakHour >= 22 || peakHour <= 4;
  const isMorning = peakHour >= 6 && peakHour <= 10;
  const isEvening = peakHour >= 18 && peakHour <= 21;

  let archetypeLabel: string;
  let story: string;

  if (isNight) {
    archetypeLabel = "The Insomniac";
    story = `Peak at ${formatHour(peakHour)}. The rest of the world is asleep. You are building something. Or spiralling. Probably both.`;
  } else if (isMorning) {
    archetypeLabel = "The Sigma";
    story = `Up before the alarm. Claude open before email. Peak at ${formatHour(peakHour)}. No distractions. No small talk. Just the grind.`;
  } else if (isEvening) {
    archetypeLabel = "The Clark Kent";
    story = `By day, perfectly normal. After 5pm, something else entirely. Peak at ${formatHour(peakHour)}. The glasses come off.`;
  } else {
    archetypeLabel = "The Day Job";
    story = `Peak usage at ${formatHour(peakHour)}. Business hours. Professional. Completely normal. Nothing to see here.`;
  }

  return {
    archetypeLabel,
    story,
    stat: formatHour(peakHour),
    statLabel: "Peak Hour",
  };
}

export function getDelegatorNarrative(stats: ComputedStats): SlideNarrative {
  const { agentToolCalls } = stats;

  let archetypeLabel: string;
  let story: string;

  if (agentToolCalls >= 100) {
    archetypeLabel = "The Dario";
    story = `${agentToolCalls} agents spawned. It is your product. Of course you delegate. Claude respects the vision.`;
  } else if (agentToolCalls >= 40) {
    archetypeLabel = "The Zucc";
    story = `${agentToolCalls} agents. Optimising for efficiency. Running at inhuman scale. Feelings not required.`;
  } else if (agentToolCalls >= 10) {
    archetypeLabel = "The IB VP";
    story = `${agentToolCalls} agent dispatches. You delegate just enough to stay out of the details. The analysts handle it.`;
  } else {
    archetypeLabel = "The Intern";
    story = `${agentToolCalls === 0 ? "Zero" : agentToolCalls} agents spawned. You are doing everything yourself. Claude can take on more. Let it.`;
  }

  return {
    archetypeLabel,
    story,
    stat: agentToolCalls.toString(),
    statLabel: "Agent Dispatches",
  };
}

export function getArsenalNarrative(stats: ComputedStats): SlideNarrative {
  const { topTools, totalToolCalls } = stats;
  const topTool = topTools[0];

  if (!topTool || totalToolCalls === 0) {
    return {
      archetypeLabel: "The Court Jester",
      story: "Zero tool calls. You talk to Claude like a person. No commands, no automation. Pure conversation.",
      stat: "0",
      statLabel: "Tool Calls",
    };
  }

  const toolName = topTool.name;
  let archetypeLabel: string;
  let story: string;

  if (toolName === "Bash") {
    archetypeLabel = "The Bash Goblin";
    story = `${topTool.count} bash commands. You run commands first and ask questions never. The terminal is home.`;
  } else if (toolName === "Read" || toolName === "Grep") {
    archetypeLabel = "The Scroll Rat";
    story = `${topTool.count} reads and searches. You spend more time reading code than writing it. Suspicious.`;
  } else if (toolName === "Edit" || toolName === "Write") {
    archetypeLabel = "The Quill Boar";
    story = `${topTool.count} edits. Claude is your ghost-coder. You dictate, it writes.`;
  } else if (toolName === "WebSearch") {
    archetypeLabel = "The Net Troll";
    story = `${topTool.count} web searches. You outsource your googling to Claude. Efficient or lazy. Jury is out.`;
  } else {
    archetypeLabel = "The Iron Mole";
    story = `${topTool.count} calls to ${toolName}. ${totalToolCalls} total tool invocations. You keep Claude busy.`;
  }

  return {
    archetypeLabel,
    story,
    stat: formatNumber(totalToolCalls),
    statLabel: "Total Tool Calls",
  };
}

export function getTokenFurnaceNarrative(stats: ComputedStats): SlideNarrative {
  const { totalTokens } = stats;

  let archetypeLabel: string;
  let story: string;

  if (totalTokens >= 200_000_000) {
    archetypeLabel = "The OpenAI";
    story = `${formatNumber(totalTokens)} tokens. Burning through context like it is runway. Shipping fast, asking questions never.`;
  } else if (totalTokens >= 10_000_000) {
    archetypeLabel = "The Anthropic";
    story = `${formatNumber(totalTokens)} tokens. Safety first. Tokens second. Somehow still impressive.`;
  } else {
    archetypeLabel = "Apple";
    story = `${formatNumber(totalTokens)} tokens. AI strategy? What AI strategy. You are pacing yourself. Intentionally. Probably.`;
  }

  return {
    archetypeLabel,
    story,
    stat: formatNumber(totalTokens),
    statLabel: "Total Tokens",
  };
}

export function getLoyaltyTestNarrative(stats: ComputedStats): SlideNarrative {
  const { primaryModel, primaryModelPercentage, modelCount } = stats;

  // Clean model name for display
  const cleanModel = primaryModel
    .replace("claude-", "")
    .replace(/-\d{8}$/, "")
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

  let archetypeLabel: string;
  let story: string;

  if (modelCount === 1) {
    archetypeLabel = "Soulmates 💍";
    story = `You found ${cleanModel} and never looked at another model. 100% loyalty. Claude is flattered.`;
  } else if (primaryModelPercentage > 0.8) {
    archetypeLabel = "Married 💍";
    story = `${Math.round(primaryModelPercentage * 100)}% ${cleanModel}. Committed. The others were nothing. Just a phase.`;
  } else {
    archetypeLabel = "The Roster 😈";
    story = `${modelCount} different models. No loyalty. No remorse. Claude knows about the others.`;
  }

  return {
    archetypeLabel,
    story,
    stat: `${Math.round(primaryModelPercentage * 100)}%`,
    statLabel: `${cleanModel}`,
  };
}

export function getThinkingHoursNarrative(stats: ComputedStats): SlideNarrative {
  const { estimatedThinkingTimeMs, avgResponseTimeMs: _avgResponseTimeMs } = stats;

  let archetypeLabel: string;
  let story: string;

  if (estimatedThinkingTimeMs > 3_600_000) {
    archetypeLabel = "The Plato";
    story = `Claude spent ${formatDuration(estimatedThinkingTimeMs)} thinking on your behalf. The allegory of the cave was just the warmup.`;
  } else if (estimatedThinkingTimeMs > 600_000) {
    archetypeLabel = "The Diogenes";
    story = `${formatDuration(estimatedThinkingTimeMs)} of thinking time. You let Claude sit with the hard questions. Barrel not included.`;
  } else {
    archetypeLabel = "The Thinker";
    story = `${formatDuration(estimatedThinkingTimeMs)} total thinking time. Posed. Contemplating. Probably not moving any time soon.`;
  }

  return {
    archetypeLabel,
    story,
    stat: formatDuration(estimatedThinkingTimeMs),
    statLabel: "Total Thinking Time",
  };
}

export function getCommitHistoryNarrative(stats: ComputedStats): SlideNarrative {
  const { projectCount, branchCount } = stats;

  let archetypeLabel: string;
  let story: string;

  if (projectCount <= 2) {
    archetypeLabel = "The Monogamist";
    story = `${projectCount} project${projectCount > 1 ? "s" : ""}. You picked a problem and you stayed with it. Rare energy.`;
  } else if (projectCount > 10) {
    archetypeLabel = "The Context Switcher";
    story = `${projectCount} projects in ${stats.daysActive} days. You start things. Whether you finish them is between you and git.`;
  } else {
    archetypeLabel = "The Branch Collector";
    story = `${projectCount} projects, ${branchCount} branches. Your branch names tell a story. Claude has seen all of them.`;
  }

  return {
    archetypeLabel,
    story,
    stat: projectCount.toString(),
    statLabel: "Projects",
  };
}

export function getSharpshooterNarrative(stats: ComputedStats): SlideNarrative {
  const { avgPromptLength, avgMessagesPerSession } = stats;

  let archetypeLabel: string;
  let story: string;

  const isShort = avgPromptLength < 80;
  const isLong = avgPromptLength > 200;
  const fewFollowUps = avgMessagesPerSession < 10;
  const manyFollowUps = avgMessagesPerSession > 25;

  if (isShort && fewFollowUps) {
    archetypeLabel = "The Sniper";
    story = `${Math.round(avgPromptLength)} chars average. ${Math.round(avgMessagesPerSession)} messages per session. You came. You asked one thing. You left. Surgical.`;
  } else if (isLong && manyFollowUps) {
    archetypeLabel = "The Novelist";
    story = `${Math.round(avgPromptLength)} chars per prompt. ${Math.round(avgMessagesPerSession)} messages per session. You write briefs. Claude writes back. You write more. This is your relationship now.`;
  } else if (isShort && manyFollowUps) {
    archetypeLabel = "The Rambler";
    story = `Short prompts but ${Math.round(avgMessagesPerSession)} messages per session. You start small and spiral. Classic.`;
  } else if (isLong && fewFollowUps) {
    archetypeLabel = "The Over-Preparer";
    story = `${Math.round(avgPromptLength)} chars average. You front-load everything. A true over-preparer. One shot, fully loaded.`;
  } else {
    archetypeLabel = "The Balanced";
    story = `${Math.round(avgPromptLength)} chars, ${Math.round(avgMessagesPerSession)} messages per session. Somewhere between a sniper and a novelist. Balanced.`;
  }

  return {
    archetypeLabel,
    story,
    stat: Math.round(avgPromptLength).toString(),
    statLabel: "Avg Prompt Length (chars)",
  };
}

export function getStreakNarrative(stats: ComputedStats): SlideNarrative {
  const { longestStreak, totalActiveDays } = stats;

  let archetypeLabel: string;
  let story: string;

  if (longestStreak > 14) {
    archetypeLabel = "The Consistent";
    story = `${longestStreak} consecutive days. Claude is load-bearing infrastructure in your life.`;
  } else if (longestStreak <= 2 && totalActiveDays > 5) {
    archetypeLabel = "The Binge Worker";
    story = `Longest streak: ${longestStreak} days. But ${totalActiveDays} active days total. You disappear for a week then come back with 200 messages in a day. Claude missed you.`;
  } else if (longestStreak <= 2) {
    archetypeLabel = "The Weekender";
    story = `${longestStreak}-day streak. ${totalActiveDays} total active days. You show up when you feel like it. Claude is always here.`;
  } else {
    archetypeLabel = "The Steady";
    story = `${longestStreak}-day best streak across ${totalActiveDays} active days. Consistency is underrated.`;
  }

  return {
    archetypeLabel,
    story,
    stat: longestStreak.toString(),
    statLabel: "Longest Streak (days)",
  };
}

export function getRetrySpiralNarrative(stats: ComputedStats): SlideNarrative {
  const { retrySpiral, retryClusters } = stats;

  let archetypeLabel: string;
  let story: string;

  if (retrySpiral < 1.5) {
    archetypeLabel = "The Sniper";
    story = `RSI of ${retrySpiral}. You rarely need a second shot. ${retryClusters} tasks, almost all first-try. Terrifying.`;
  } else if (retrySpiral <= 3.0) {
    archetypeLabel = "The Refiner";
    story = `RSI of ${retrySpiral}. You were one prompt away. Again and again and again. ${retryClusters} attempt clusters, each one a little closer.`;
  } else {
    archetypeLabel = "The Loop Artist";
    story = `RSI of ${retrySpiral}. You live in the edit. ${retryClusters} clusters, averaging ${retrySpiral} attempts each. Shipping is optional.`;
  }

  return {
    archetypeLabel,
    story,
    stat: retrySpiral.toString(),
    statLabel: "Retry Spiral Index",
  };
}

export function getTopProjectsNarrative(stats: ComputedStats): SlideNarrative {
  const { topProjectStats, projectCount } = stats;
  const top = topProjectStats[0];
  if (!top || projectCount === 0) {
    return {
      archetypeLabel: "The Ghost",
      story: "No projects found. You either haven't started or you've erased the evidence.",
      stat: "0",
      statLabel: "Projects",
    };
  }

  const topName = top.name.split("/").pop() || top.name;
  const topPct = stats.totalMessages > 0 ? Math.round((top.messages / stats.totalMessages) * 100) : 0;

  let archetypeLabel: string;
  let story: string;

  if (projectCount === 1) {
    archetypeLabel = "The One-Track Mind";
    story = `One project. ${formatNumber(top.messages)} messages. You locked in and never looked away. Tunnel vision is a feature.`;
  } else if (topPct > 70) {
    archetypeLabel = "The Main Character";
    story = `${topPct}% of your messages went to ${topName}. The other ${projectCount - 1} projects are side quests.`;
  } else if (projectCount > 8) {
    archetypeLabel = "The Juggler";
    story = `${projectCount} projects, no clear favourite. You keep ${projectCount} plates spinning and somehow none have shattered. Yet.`;
  } else {
    archetypeLabel = "The Portfolio Manager";
    story = `${projectCount} projects, ${topName} leading with ${topPct}%. Diversified. Hedged. You don't put all your tokens in one repo.`;
  }

  return {
    archetypeLabel,
    story,
    stat: projectCount.toString(),
    statLabel: "Total Projects",
  };
}

export function getStopReasonNarrative(stats: ComputedStats): SlideNarrative {
  const { toolUseRatio, endTurnRatio, stopReasonCounts } = stats;
  const totalStops = Object.values(stopReasonCounts).reduce((a, b) => a + b, 0);

  let archetypeLabel: string;
  let story: string;

  if (toolUseRatio > 0.6) {
    archetypeLabel = "The Iterative";
    story = `${Math.round(toolUseRatio * 100)}% tool_use stops. Most of your sessions never really end. Claude just keeps calling tools until something works.`;
  } else if (endTurnRatio > 0.6) {
    archetypeLabel = "The Decisive";
    story = `${Math.round(endTurnRatio * 100)}% clean endings. Question asked, answer given, done. You respect boundaries.`;
  } else {
    archetypeLabel = "The Mixed Signal";
    story = `${totalStops} total completions. Sometimes Claude needs ten tool calls to satisfy you. Sometimes one word does it.`;
  }

  return {
    archetypeLabel,
    story,
    stat: `${Math.round(toolUseRatio * 100)}%`,
    statLabel: "Tool Use Stops",
  };
}
