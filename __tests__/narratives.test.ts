import {
  getGraveyardShiftNarrative,
  getDelegatorNarrative,
  getTokenFurnaceNarrative,
  getLoyaltyTestNarrative,
  getThinkingHoursNarrative,
  getStreakNarrative,
  getRetrySpiralNarrative,
  getTopProjectsNarrative,
} from "@/lib/narratives";
import { ComputedStats } from "@/types";

const baseStats: ComputedStats = {
  hourDistribution: new Array(24).fill(10),
  peakHour: 14,
  peakHourCount: 50,
  totalMessages: 500,
  sidechainMessages: 20,
  sidechainRatio: 0.04,
  agentToolCalls: 5,
  toolCounts: { Bash: 100, Read: 80 },
  topTools: [{ name: "Bash", count: 100 }],
  totalToolCalls: 300,
  totalInputTokens: 100_000_000,
  totalOutputTokens: 50_000_000,
  totalCacheReadTokens: 50_000_000,
  totalCacheCreationTokens: 10_000_000,
  totalTokens: 210_000_000,
  modelCounts: { "claude-sonnet-4": 400 },
  primaryModel: "claude-sonnet-4",
  primaryModelPercentage: 0.9,
  modelCount: 1,
  estimatedThinkingTimeMs: 3_700_000,
  avgResponseTimeMs: 3000,
  maxResponseTimeMs: 30000,
  uniqueProjects: ["/home/user/project-a", "/home/user/project-b"],
  uniqueBranches: ["main", "dev"],
  projectCount: 2,
  branchCount: 2,
  projectActivity: { "/home/user/project-a": 300, "/home/user/project-b": 200 },
  avgPromptLength: 80,
  avgMessagesPerSession: 15,
  medianPromptLength: 70,
  longestStreak: 10,
  currentStreak: 3,
  totalActiveDays: 20,
  dailyActivity: [],
  activeDates: [],
  stopReasonCounts: { tool_use: 200, end_turn: 100 },
  toolUseRatio: 0.67,
  endTurnRatio: 0.33,
  totalSessions: 40,
  firstSessionDate: "2024-01-01",
  lastSessionDate: "2024-02-01",
  daysActive: 20,
  longestSessionMessages: 80,
  longestSessionDurationMs: 7200000,
  retrySpiral: 1.8,
  retryClusters: 50,
  totalRetries: 90,
  topProjectStats: [
    { name: "/home/user/project-a", messages: 300, tokens: 1_000_000, sessions: 20 },
    { name: "/home/user/project-b", messages: 200, tokens: 800_000, sessions: 20 },
  ],
};

describe("narrative functions", () => {
  it.each([
    ["getGraveyardShiftNarrative", () => getGraveyardShiftNarrative(baseStats)],
    ["getDelegatorNarrative", () => getDelegatorNarrative(baseStats)],
    ["getTokenFurnaceNarrative", () => getTokenFurnaceNarrative(baseStats)],
    ["getLoyaltyTestNarrative", () => getLoyaltyTestNarrative(baseStats)],
    ["getThinkingHoursNarrative", () => getThinkingHoursNarrative(baseStats)],
    ["getStreakNarrative", () => getStreakNarrative(baseStats)],
    ["getRetrySpiralNarrative", () => getRetrySpiralNarrative(baseStats)],
    ["getTopProjectsNarrative", () => getTopProjectsNarrative(baseStats)],
  ])("%s returns required fields", (_, fn) => {
    const result = fn();
    expect(result).toHaveProperty("archetypeLabel");
    expect(result).toHaveProperty("story");
    expect(result).toHaveProperty("stat");
    expect(result).toHaveProperty("statLabel");
    expect(result.archetypeLabel.length).toBeGreaterThan(0);
    expect(result.story.length).toBeGreaterThan(0);
  });

  describe("getGraveyardShiftNarrative", () => {
    it("assigns The Insomniac for midnight peak", () => {
      const n = getGraveyardShiftNarrative({ ...baseStats, peakHour: 2 });
      expect(n.archetypeLabel).toBe("The Insomniac");
    });
    it("assigns The Sigma for early morning peak", () => {
      const n = getGraveyardShiftNarrative({ ...baseStats, peakHour: 8 });
      expect(n.archetypeLabel).toBe("The Sigma");
    });
    it("assigns The Clark Kent for evening peak", () => {
      const n = getGraveyardShiftNarrative({ ...baseStats, peakHour: 19 });
      expect(n.archetypeLabel).toBe("The Clark Kent");
    });
    it("assigns The Day Job for business hours", () => {
      const n = getGraveyardShiftNarrative({ ...baseStats, peakHour: 14 });
      expect(n.archetypeLabel).toBe("The Day Job");
    });
  });

  describe("getDelegatorNarrative", () => {
    it("assigns The Intern for zero agents", () => {
      const n = getDelegatorNarrative({ ...baseStats, agentToolCalls: 0 });
      expect(n.archetypeLabel).toBe("The Intern");
    });
    it("assigns The IB VP for mid-range agents", () => {
      const n = getDelegatorNarrative({ ...baseStats, agentToolCalls: 20 });
      expect(n.archetypeLabel).toBe("The IB VP");
    });
    it("assigns The Zucc for high agents", () => {
      const n = getDelegatorNarrative({ ...baseStats, agentToolCalls: 50 });
      expect(n.archetypeLabel).toBe("The Zucc");
    });
    it("assigns The Dario for 100+ agents", () => {
      const n = getDelegatorNarrative({ ...baseStats, agentToolCalls: 120 });
      expect(n.archetypeLabel).toBe("The Dario");
    });
  });

  describe("getTokenFurnaceNarrative", () => {
    it("assigns Apple for low token count", () => {
      const n = getTokenFurnaceNarrative({ ...baseStats, totalTokens: 5_000_000 });
      expect(n.archetypeLabel).toBe("Apple");
    });
    it("assigns The Anthropic for mid token count", () => {
      const n = getTokenFurnaceNarrative({ ...baseStats, totalTokens: 50_000_000 });
      expect(n.archetypeLabel).toBe("The Anthropic");
    });
    it("assigns The OpenAI for massive token count", () => {
      const n = getTokenFurnaceNarrative({ ...baseStats, totalTokens: 300_000_000 });
      expect(n.archetypeLabel).toBe("The OpenAI");
    });
  });

  describe("getRetrySpiralNarrative", () => {
    it("assigns The Sniper for low RSI", () => {
      const n = getRetrySpiralNarrative({ ...baseStats, retrySpiral: 1.2 });
      expect(n.archetypeLabel).toBe("The Sniper");
    });
    it("assigns The Refiner for mid RSI", () => {
      const n = getRetrySpiralNarrative({ ...baseStats, retrySpiral: 2.0 });
      expect(n.archetypeLabel).toBe("The Refiner");
    });
    it("assigns The Loop Artist for high RSI", () => {
      const n = getRetrySpiralNarrative({ ...baseStats, retrySpiral: 4.0 });
      expect(n.archetypeLabel).toBe("The Loop Artist");
    });
  });
});
