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
    name: "The Dario",
    oneLiner: "You are not building features. You are changing the world. Probably.",
    endingLine: "Claude believes in you.",
    description: "Anthropic CEO, measured optimism, building AGI responsibly.",
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
    name: "The Torvalds",
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
    name: "The Musk",
    oneLiner:
      "You burned through tokens like federal contracts. Promised $2 trillion in savings. Claude checked the receipts. Came out to $2 billion. You're calling it somewhat successful.",
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
    name: "The Sama",
    oneLiner: "Locked out of your own project on a Friday. Back by Monday. 95% of the team voted. Claude would too.",
    endingLine: "Claude believes in you.",
    description: "Turtleneck, one more thing energy, somehow always lands on top.",
    score: (s) => {
      let score = 0;
      if (s.projectCount > 3) score += 20;
      if (s.totalSessions > 50) score += 20;
      if (s.peakHour >= 8 && s.peakHour <= 18) score += 15;
      if (s.longestStreak > 7) score += 15;
      return score;
    },
  },
  {
    name: "The SBF",
    oneLiner: "High conviction. No risk management. Effective altruism. Allegedly.",
    endingLine: "Claude is not liable for this.",
    description: "Cargo shorts, beanbag, eight monitors, everything is fine.",
    score: (s) => {
      let score = 0;
      if (s.modelCount > 2) score += 15;
      if (s.peakHour >= 22 || s.peakHour <= 4) score += 20;
      if (s.longestStreak < 3) score += 20;
      if (s.avgMessagesPerSession > 25) score += 15;
      return score;
    },
  },
  {
    name: "Slough Boy",
    oneLiner: "Built faster than anyone expected, from somewhere nobody expected. The postcode was never the limit.",
    endingLine: "Claude was there from the start.",
    description: "Laptop, group chat, something to prove. Origin story in progress.",
    score: (s) => s.totalMessages,
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
  const seed = (stats.totalMessages * 2654435761) >>> 0;
  const pick = characters[seed % characters.length];
  return {
    name: pick.name,
    oneLiner: pick.oneLiner,
    endingLine: pick.endingLine,
    description: pick.description,
  };
}
