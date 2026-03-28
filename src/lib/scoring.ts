import { ComputedStats, CPSBreakdown } from "@/types";

export function computeCPS(stats: ComputedStats): CPSBreakdown {
  const precisionIndex = Math.min(
    150,
    Math.round(
      (stats.avgPromptLength > 0 ? Math.min(1, 100 / stats.avgPromptLength) : 0) * 75 + stats.endTurnRatio * 75
    )
  );

  const depthScore = Math.min(150, Math.round(Math.min(1, stats.avgMessagesPerSession / 30) * 150));

  const consistency = Math.min(
    100,
    Math.round(
      stats.totalActiveDays > 0
        ? Math.min(1, stats.longestStreak / Math.max(1, stats.daysActive)) * 60 +
            Math.min(1, stats.totalActiveDays / 30) * 40
        : 0
    )
  );

  const loyaltyBonus = Math.min(
    100,
    Math.round(stats.primaryModelPercentage > 0.8 ? 100 : stats.modelCount <= 2 ? 70 : stats.modelCount <= 3 ? 40 : 20)
  );

  const completionRate = Math.min(
    150,
    Math.round((1 - (stats.totalSessions > 0 ? Math.max(0, 1 - stats.totalActiveDays / stats.totalSessions) : 0)) * 150)
  );

  const velocityScore = Math.min(100, Math.round(Math.min(1, stats.avgMessagesPerSession / 20) * 100));

  const topicBreadth = Math.min(100, Math.round(Math.min(1, stats.projectCount / 10) * 100));

  const nightHourMessages = [0, 1, 2, 3].reduce((sum, h) => sum + (stats.hourDistribution[h] || 0), 0);
  const totalHourMessages = stats.hourDistribution.reduce((a, b) => a + b, 0);
  const nightRatio = totalHourMessages > 0 ? nightHourMessages / totalHourMessages : 0;
  const nightBonus = nightRatio > 0.1 ? Math.min(50, Math.round(nightRatio * 250)) : 0;

  const streakBonus = Math.min(100, Math.round(Math.min(1, stats.longestStreak / 14) * 100));

  const total =
    precisionIndex +
    depthScore +
    consistency +
    loyaltyBonus +
    completionRate +
    velocityScore +
    topicBreadth +
    nightBonus +
    streakBonus;

  return {
    precisionIndex,
    depthScore,
    consistency,
    loyaltyBonus,
    completionRate,
    velocityScore,
    topicBreadth,
    nightBonus,
    streakBonus,
    total: Math.min(1000, total),
  };
}
