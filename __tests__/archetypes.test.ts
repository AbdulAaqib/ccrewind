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
  username: "",
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

  it("handles near-zero usage without crashing", () => {
    const lowStats = {
      ...baseStats,
      totalSessions: 2,
      totalMessages: 10,
      avgMessagesPerSession: 3,
      longestStreak: 1,
    };
    const char = assignCharacter(lowStats);
    expect(char).toHaveProperty("name");
    expect(char.name.length).toBeGreaterThan(0);
  });

  it("is deterministic for the same totalMessages", () => {
    const charA = assignCharacter(baseStats);
    const charB = assignCharacter(baseStats);
    expect(charA.name).toBe(charB.name);
  });

  it("returns a different character for different totalMessages", () => {
    // totalMessages=1 -> Slough Boy, totalMessages=2 -> The Dario
    const charA = assignCharacter({
      ...baseStats,
      totalMessages: 1,
    });
    const charB = assignCharacter({
      ...baseStats,
      totalMessages: 2,
    });
    expect(charA.name).not.toBe(charB.name);
  });

  it("character names are from the known set", () => {
    const validNames = [
      "The Quant",
      "The Dario",
      "The Degen",
      "The Torvalds",
      "The Musk",
      "The Sama",
      "The SBF",
      "Slough Boy",
      "The Intern",
    ];
    const char = assignCharacter(baseStats);
    expect(validNames).toContain(char.name);
  });
});
