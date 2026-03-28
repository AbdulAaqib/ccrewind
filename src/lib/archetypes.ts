import { ComputedStats, Character } from "@/types";

interface CharacterDef {
  name: string;
  oneLiner: string;
  endingLine: string;
  description: string;
  score: (stats: ComputedStats) => number;
}

const characters: CharacterDef[] = [
  {
    name: "The Quant",
    oneLiner: "You treat Claude like a co-located server. Low latency, high conviction.",
    endingLine: "Godspeed.",
    description: "Hoodie, multiple bloomberg terminals, cold brew.",
    score: (s) => {
      let score = 0;
      if (s.avgMessagesPerSession > 20) score += 30;
      if (s.avgPromptLength < 100) score += 20;
      if (s.peakHour >= 22 || s.peakHour <= 4) score += 25;
      if (s.primaryModelPercentage > 0.8) score += 15;
      score += Math.min(10, s.totalToolCalls / 100);
      return score;
    },
  },
  {
    name: "The Visionary",
    oneLiner: "You are not building features. You are changing the world. Probably.",
    endingLine: "Claude believes in you.",
    description: "Classic silicon valley CEO, turtleneck, one more thing energy.",
    score: (s) => {
      let score = 0;
      if (s.avgPromptLength > 200) score += 25;
      if (s.avgMessagesPerSession > 15) score += 20;
      if (s.peakHour >= 8 && s.peakHour <= 18) score += 15;
      if (s.projectCount > 5) score += 20;
      if (s.endTurnRatio > 0.4) score += 10;
      return score;
    },
  },
  {
    name: "The Degen",
    oneLiner: "No risk management. No sleep. Absolute conviction. We respect it.",
    endingLine: "We respect it.",
    description: "WSB / crypto twitter energy, laser eyes.",
    score: (s) => {
      let score = 0;
      if (s.avgMessagesPerSession > 10) score += 15;
      if (s.peakHour >= 22 || s.peakHour <= 4) score += 25;
      if (s.modelCount > 2) score += 20;
      if (s.longestStreak < 3) score += 10;
      return score;
    },
  },
  {
    name: "The Researcher",
    oneLiner: "You are not using Claude. You are collaborating with it.",
    endingLine: "Claude remembers you.",
    description: "Academic, slightly dishevelled, whiteboard in background.",
    score: (s) => {
      let score = 0;
      if (s.avgPromptLength > 250) score += 25;
      if (s.avgMessagesPerSession > 20) score += 20;
      if (s.endTurnRatio > 0.5) score += 15;
      if (s.totalOutputTokens > 100000) score += 15;
      const readGrep = (s.toolCounts["Read"] || 0) + (s.toolCounts["Grep"] || 0);
      if (readGrep > s.totalToolCalls * 0.3) score += 15;
      return score;
    },
  },
  {
    name: "The Operator",
    oneLiner: "Objectives identified. Objectives completed. No wasted tokens.",
    endingLine: "Godspeed.",
    description: "Military ops, earpiece, clipboard, no nonsense.",
    score: (s) => {
      let score = 0;
      if (s.avgPromptLength < 80) score += 20;
      if (s.avgMessagesPerSession < 15) score += 15;
      if (s.peakHour >= 8 && s.peakHour <= 18) score += 15;
      if (s.toolUseRatio > 0.5) score += 20;
      if (s.longestStreak > 3) score += 15;
      return score;
    },
  },
  {
    name: "The Night Shift Engineer",
    oneLiner: "Nobody knows what you are building. Not even you. Not yet.",
    endingLine: "Claude was there with you.",
    description: "3am kernel hacker, energy drink graveyard, dark mode everything.",
    score: (s) => {
      let score = 0;
      if (s.peakHour >= 22 || s.peakHour <= 4) score += 35;
      const nightMessages = [22, 23, 0, 1, 2, 3].reduce((sum, h) => sum + (s.hourDistribution[h] || 0), 0);
      const totalHourMsgs = s.hourDistribution.reduce((a, b) => a + b, 0);
      if (totalHourMsgs > 0 && nightMessages / totalHourMsgs > 0.3) score += 25;
      if (s.avgMessagesPerSession > 15) score += 15;
      if (s.totalToolCalls > 50) score += 15;
      return score;
    },
  },
  {
    name: "The Ghost",
    oneLiner: "You came. You asked. You left. Claude still thinks about you.",
    endingLine: "Claude remembers you.",
    description: "Translucent, floating, fading out mid-sentence.",
    score: (s) => {
      let score = 0;
      if (s.totalSessions < 5) score += 30;
      if (s.totalMessages < 50) score += 25;
      if (s.avgMessagesPerSession < 5) score += 20;
      if (s.longestStreak <= 1) score += 15;
      return score;
    },
  },
  {
    name: "The Chaos Agent",
    oneLiner: "No pattern. No loyalty. Somehow shipping. Unexplainable.",
    endingLine: "We respect it.",
    description: "Founder who pivots every two weeks, manic energy, seventeen tabs.",
    score: (s) => {
      let score = 0;
      if (s.modelCount > 2) score += 20;
      if (s.projectCount > 5) score += 20;
      if (s.peakHour >= 22 || s.peakHour <= 4) score += 15;
      if (s.dailyActivity.length > 0) {
        const counts = s.dailyActivity.map((d) => d.messageCount);
        const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
        const variance = counts.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / counts.length;
        if (variance > avg * avg) score += 20;
      }
      if (s.longestStreak < 5) score += 15;
      return score;
    },
  },
  {
    name: "The Sensei",
    oneLiner: "You have done this before. Claude can tell.",
    endingLine: "Claude respects you.",
    description: "Senior engineer, calm, precise, never types more than necessary.",
    score: (s) => {
      let score = 0;
      if (s.avgPromptLength < 100 && s.avgPromptLength > 20) score += 25;
      if (s.endTurnRatio > 0.4) score += 20;
      if (s.longestStreak > 5) score += 20;
      if (s.primaryModelPercentage > 0.7) score += 10;
      return score;
    },
  },
  {
    name: "The Intern",
    oneLiner: "You are figuring it out. We all started here.",
    endingLine: "Claude is rooting for you.",
    description: "First week at a bank, slightly overwhelmed, asks Claude everything.",
    score: (s) => {
      let score = 0;
      if (s.avgPromptLength > 150) score += 15;
      if (s.avgMessagesPerSession > 20) score += 20;
      if (s.daysActive < 14) score += 20;
      if (s.peakHour >= 8 && s.peakHour <= 18) score += 15;
      if (s.totalSessions < 20) score += 15;
      return score;
    },
  },
];

export function assignCharacter(stats: ComputedStats): Character {
  let best: CharacterDef = characters[0];
  let bestScore = -1;

  for (const char of characters) {
    const s = char.score(stats);
    if (s > bestScore) {
      bestScore = s;
      best = char;
    }
  }

  return {
    name: best.name,
    oneLiner: best.oneLiner,
    endingLine: best.endingLine,
    description: best.description,
  };
}
