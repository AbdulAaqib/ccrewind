import { assignCharacter } from "@/lib/archetypes";
import { ComputedStats } from "@/types";

const baseStats: ComputedStats = {
  hourDistribution: new Array(24).fill(0),
  peakHour: 14,
  peakHourCount: 50,
  totalMessages: 500,
  sidechainMessages: 20,
  sidechainRatio: 0.04,
  agentToolCalls: 5,
  toolCounts: { Bash: 100, Read: 80 },
  topTools: [{ name: "Bash", count: 100 }],
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
  uniqueProjects: ["/home/user/project-a"],
  uniqueBranches: ["main"],
  projectCount: 1,
  branchCount: 1,
  projectActivity: { "/home/user/project-a": 500 },
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
  topProjectStats: [{ name: "/home/user/project-a", messages: 500, tokens: 1_000_000, sessions: 40 }],
};

describe("assignCharacter", () => {
  it("always returns a character with required fields", () => {
    const char = assignCharacter(baseStats);
    expect(char).toHaveProperty("name");
    expect(char).toHaveProperty("oneLiner");
    expect(char).toHaveProperty("endingLine");
    expect(char).toHaveProperty("description");
    expect(typeof char.name).toBe("string");
    expect(char.name.length).toBeGreaterThan(0);
  });

  it("assigns The Ghost to near-zero usage", () => {
    const ghostStats = {
      ...baseStats,
      totalSessions: 2,
      totalMessages: 10,
      avgMessagesPerSession: 3,
      longestStreak: 1,
    };
    const char = assignCharacter(ghostStats);
    expect(char.name).toBe("The Ghost");
  });

  it("assigns The Torvalds to heavy night usage", () => {
    const nightDist = new Array(24).fill(0);
    nightDist[1] = 200;
    nightDist[2] = 200;
    nightDist[3] = 200;
    const nightOwlStats = {
      ...baseStats,
      hourDistribution: nightDist,
      peakHour: 2,
      avgMessagesPerSession: 20,
      totalToolCalls: 100,
    };
    const char = assignCharacter(nightOwlStats);
    expect(char.name).toBe("The Torvalds");
  });

  it("returns a different character depending on stats", () => {
    const charA = assignCharacter({
      ...baseStats,
      totalSessions: 2,
      totalMessages: 5,
      avgMessagesPerSession: 2,
      longestStreak: 0,
    });
    const charB = assignCharacter({
      ...baseStats,
      avgPromptLength: 50,
      peakHour: 12,
      longestStreak: 8,
      endTurnRatio: 0.6,
    });
    expect(charA.name).not.toBe(charB.name);
  });

  it("character names are from the known set", () => {
    const validNames = [
      "The Quant",
      "The Altman",
      "The Degen",
      "The Hinton",
      "The Operator",
      "The Torvalds",
      "The Ghost",
      "The Musk",
      "The Carmack",
      "The Intern",
    ];
    const char = assignCharacter(baseStats);
    expect(validNames).toContain(char.name);
  });
});
