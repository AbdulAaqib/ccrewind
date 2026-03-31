import { computeElo } from "@/lib/scoring";
import { ComputedStats } from "@/types";

const baseStats: ComputedStats = {
  hourDistribution: new Array(24).fill(0),
  peakHour: 14,
  peakHourCount: 50,
  totalMessages: 500,
  sidechainMessages: 20,
  sidechainRatio: 0.04,
  agentToolCalls: 5,
  toolCounts: { Bash: 100, Read: 80, Edit: 60 },
  topTools: [
    { name: "Bash", count: 100 },
    { name: "Read", count: 80 },
  ],
  totalToolCalls: 300,
  totalInputTokens: 1_000_000,
  totalOutputTokens: 500_000,
  totalCacheReadTokens: 200_000,
  totalCacheCreationTokens: 100_000,
  totalTokens: 1_800_000,
  modelCounts: { "claude-sonnet-4": 400 },
  primaryModel: "claude-sonnet-4",
  primaryModelPercentage: 1.0,
  modelCount: 1,
  estimatedThinkingTimeMs: 120_000,
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

describe("computeElo", () => {
  it("returns a breakdown with all 9 components", () => {
    const cps = computeElo(baseStats);
    expect(cps).toHaveProperty("precisionIndex");
    expect(cps).toHaveProperty("depthScore");
    expect(cps).toHaveProperty("consistency");
    expect(cps).toHaveProperty("loyaltyBonus");
    expect(cps).toHaveProperty("completionRate");
    expect(cps).toHaveProperty("velocityScore");
    expect(cps).toHaveProperty("topicBreadth");
    expect(cps).toHaveProperty("nightBonus");
    expect(cps).toHaveProperty("streakBonus");
    expect(cps).toHaveProperty("total");
  });

  it("total never exceeds 1000", () => {
    const maxStats = {
      ...baseStats,
      longestStreak: 100,
      totalActiveDays: 100,
      avgMessagesPerSession: 100,
      projectCount: 20,
    };
    const cps = computeElo(maxStats);
    expect(cps.total).toBeLessThanOrEqual(1000);
  });

  it("total is always non-negative", () => {
    const zeroStats = {
      ...baseStats,
      totalMessages: 0,
      totalActiveDays: 0,
      longestStreak: 0,
      avgMessagesPerSession: 0,
      avgPromptLength: 0,
      projectCount: 0,
    };
    const cps = computeElo(zeroStats);
    expect(cps.total).toBeGreaterThanOrEqual(0);
  });

  it("single model loyalty scores 100", () => {
    const cps = computeElo({ ...baseStats, primaryModelPercentage: 0.95, modelCount: 1 });
    expect(cps.loyaltyBonus).toBe(100);
  });

  it("many models reduces loyalty score", () => {
    const cps = computeElo({ ...baseStats, primaryModelPercentage: 0.4, modelCount: 5 });
    expect(cps.loyaltyBonus).toBeLessThan(100);
  });

  it("night owl earns night bonus", () => {
    const nightDist = new Array(24).fill(0);
    nightDist[1] = 100;
    nightDist[2] = 100;
    const cps = computeElo({ ...baseStats, hourDistribution: nightDist });
    expect(cps.nightBonus).toBeGreaterThan(0);
  });

  it("no night usage earns zero night bonus", () => {
    const dayDist = new Array(24).fill(0);
    dayDist[14] = 100;
    const cps = computeElo({ ...baseStats, hourDistribution: dayDist });
    expect(cps.nightBonus).toBe(0);
  });

  it("longer streak gives higher streak bonus", () => {
    const shortStreak = computeElo({ ...baseStats, longestStreak: 1 });
    const longStreak = computeElo({ ...baseStats, longestStreak: 14 });
    expect(longStreak.streakBonus).toBeGreaterThan(shortStreak.streakBonus);
  });

  it("individual components do not exceed their caps", () => {
    const cps = computeElo(baseStats);
    expect(cps.precisionIndex).toBeLessThanOrEqual(150);
    expect(cps.depthScore).toBeLessThanOrEqual(150);
    expect(cps.consistency).toBeLessThanOrEqual(100);
    expect(cps.loyaltyBonus).toBeLessThanOrEqual(100);
    expect(cps.completionRate).toBeLessThanOrEqual(150);
    expect(cps.velocityScore).toBeLessThanOrEqual(100);
    expect(cps.topicBreadth).toBeLessThanOrEqual(100);
    expect(cps.nightBonus).toBeLessThanOrEqual(50);
    expect(cps.streakBonus).toBeLessThanOrEqual(100);
  });
});
