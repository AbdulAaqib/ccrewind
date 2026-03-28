/** Compact share URL encoding — character index + numeric stats, pipe-delimited */

const CHARACTER_NAMES = [
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

const CHARACTER_ONELINERS: Record<string, string> = {
  "The Quant": "You treat Claude like a co-located server. Low latency, high conviction.",
  "The Altman": "You are not building features. You are changing the world. Probably.",
  "The Degen": "No risk management. No sleep. Absolute conviction. We respect it.",
  "The Hinton": "You are not using Claude. You are collaborating with it.",
  "The Operator": "Objectives identified. Objectives completed. No wasted tokens.",
  "The Torvalds": "Nobody knows what you are building. Not even you. Not yet.",
  "The Ghost": "You came. You asked. You left. Claude still thinks about you.",
  "The Musk": "No pattern. No loyalty. Somehow shipping. Unexplainable.",
  "The Carmack": "You have done this before. Claude can tell.",
  "The Intern": "You are figuring it out. We all started here.",
};

const CHARACTER_ENDINGS: Record<string, string> = {
  "The Quant": "Godspeed.",
  "The Altman": "Claude believes in you.",
  "The Degen": "We respect it.",
  "The Hinton": "Claude remembers you.",
  "The Operator": "Godspeed.",
  "The Torvalds": "Claude was there with you.",
  "The Ghost": "Claude remembers you.",
  "The Musk": "We respect it.",
  "The Carmack": "Claude respects you.",
  "The Intern": "Claude is rooting for you.",
};

export interface ShareData {
  name: string;
  oneLiner: string;
  endingLine: string;
  cps: number;
  totalMessages: number;
  longestStreak: number;
  peakHour: number;
  primaryModelPct: number;
  totalSessions: number;
}

/**
 * Encode format: "i.c.m.s.h.p.t" — 7 numbers dot-separated
 * i=character index, c=cps, m=messages, s=streak, h=peakHour, p=modelPct, t=sessions
 */
export function encodeShareData(data: ShareData): string {
  const idx = CHARACTER_NAMES.indexOf(data.name);
  const i = idx >= 0 ? idx : 0;
  return [i, data.cps, data.totalMessages, data.longestStreak, data.peakHour, data.primaryModelPct, data.totalSessions].join(".");
}

export function decodeShareData(encoded: string): ShareData | null {
  try {
    const parts = encoded.split(".").map(Number);
    if (parts.length < 7 || parts.some(isNaN)) return null;

    const [i, cps, totalMessages, longestStreak, peakHour, primaryModelPct, totalSessions] = parts;
    const name = CHARACTER_NAMES[i] ?? CHARACTER_NAMES[0];

    return {
      name,
      oneLiner: CHARACTER_ONELINERS[name] ?? "",
      endingLine: CHARACTER_ENDINGS[name] ?? "",
      cps,
      totalMessages,
      longestStreak,
      peakHour,
      primaryModelPct,
      totalSessions,
    };
  } catch {
    return null;
  }
}

export function buildShareURL(data: ShareData): string {
  const encoded = encodeShareData(data);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/share?d=${encoded}`;
}
