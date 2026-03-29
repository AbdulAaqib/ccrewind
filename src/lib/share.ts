/** Compact share URL encoding — character index + numeric stats, dot-delimited */

const CHARACTER_NAMES = [
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

const CHARACTER_ONELINERS: Record<string, string> = {
  "The Quant": "You treat Claude like a co-located server. Low latency, high conviction.",
  "The Dario": "You are not building features. You are changing the world. Probably.",
  "The Degen": "No risk management. No sleep. Absolute conviction. We respect it.",
  "The Torvalds": "Nobody knows what you are building. Not even you. Not yet.",
  "The Musk":
    "You burned through tokens like federal contracts. Promised $2 trillion in savings. Claude checked the receipts. Came out to $2 billion. You're calling it somewhat successful.",
  "The Sama": "Locked out of your own project on a Friday. Back by Monday. 95% of the team voted. Claude would too.",
  "The SBF": "High conviction. No risk management. Effective altruism. Allegedly.",
  "Slough Boy": "Built faster than anyone expected, from somewhere nobody expected. The postcode was never the limit.",
  "The Intern": "You are figuring it out. We all started here.",
};

const CHARACTER_ENDINGS: Record<string, string> = {
  "The Quant": "Godspeed.",
  "The Dario": "Claude believes in you.",
  "The Degen": "We respect it.",
  "The Torvalds": "Claude was there with you.",
  "The Musk": "We respect it.",
  "The Sama": "Claude believes in you.",
  "The SBF": "Claude is not liable for this.",
  "Slough Boy": "Claude was there from the start.",
  "The Intern": "Claude is rooting for you.",
};

const MODEL_NAMES = ["sonnet-4", "opus-4", "haiku-3.5", "sonnet-3.5", "sonnet-3.6", "opus-3", "unknown"];

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
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheTokens: number;
  estimatedCostCents: number;
  primaryModel: string;
  username: string;
}

/**
 * Encode: "i.c.m.s.h.p.t.tk.it.ot.ct.cost.model" — 13 numbers dot-separated
 */
export function encodeShareData(data: ShareData): string {
  const charIdx = Math.max(0, CHARACTER_NAMES.indexOf(data.name));
  const modelIdx = Math.max(
    0,
    MODEL_NAMES.findIndex((m) => data.primaryModel.includes(m))
  );
  const nums = [
    charIdx,
    data.cps,
    data.totalMessages,
    data.longestStreak,
    data.peakHour,
    data.primaryModelPct,
    data.totalSessions,
    data.totalTokens,
    data.totalInputTokens,
    data.totalOutputTokens,
    data.totalCacheTokens,
    data.estimatedCostCents,
    modelIdx,
  ].join(".");
  // Append username after a pipe separator
  return data.username ? `${nums}|${data.username}` : nums;
}

export function decodeShareData(encoded: string): ShareData | null {
  try {
    // Split username from numbers: "1.2.3|username"
    const [numsPart, username] = encoded.split("|");
    const parts = numsPart.split(".").map(Number);
    if (parts.length < 7 || parts.some(isNaN)) return null;

    const [
      i,
      cps,
      totalMessages,
      longestStreak,
      peakHour,
      primaryModelPct,
      totalSessions,
      totalTokens,
      totalInputTokens,
      totalOutputTokens,
      totalCacheTokens,
      estimatedCostCents,
      modelIdx,
    ] = parts;
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
      totalTokens: totalTokens ?? 0,
      totalInputTokens: totalInputTokens ?? 0,
      totalOutputTokens: totalOutputTokens ?? 0,
      totalCacheTokens: totalCacheTokens ?? 0,
      estimatedCostCents: estimatedCostCents ?? 0,
      primaryModel: MODEL_NAMES[modelIdx ?? 0] ?? "unknown",
      username: username ?? "",
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
