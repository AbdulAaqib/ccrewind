import { ParsedData, StatsCache, HistoryEntry, SessionData, SessionMessage, ContentBlock } from "@/types";

// Seeded pseudo-random for deterministic demo data
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

const DEMO_PROJECTS = [
  "ccrewind",
  "api-gateway",
  "ml-pipeline",
  "dashboard-v2",
  "auth-service",
  "data-ingestion",
  "mobile-app",
  "infra-terraform",
  "docs-site",
  "trading-bot",
  "analytics-engine",
  "notification-service",
];

const DEMO_BRANCHES = [
  "main",
  "feat/auth-refactor",
  "fix/token-leak",
  "feat/dark-mode",
  "chore/deps-update",
  "feat/streaming-api",
  "fix/race-condition",
  "feat/caching-layer",
];

const TOOL_NAMES = ["Bash", "Read", "Edit", "Write", "Grep", "Glob", "Agent", "WebSearch", "NotebookEdit"];

const DEMO_PROMPTS = [
  "fix the auth middleware to handle expired tokens",
  "add rate limiting to the API gateway",
  "refactor the database connection pool",
  "write tests for the user service",
  "update the CI pipeline to run parallel jobs",
  "debug why the WebSocket connection drops",
  "implement the caching layer for API responses",
  "review this pull request and suggest improvements",
  "optimize the query that's causing slow page loads",
  "add TypeScript types to the legacy JavaScript module",
  "set up monitoring alerts for the production environment",
  "migrate the database schema for the new feature",
  "implement OAuth2 flow with PKCE",
  "fix the race condition in the notification service",
  "add error handling to the data ingestion pipeline",
  "refactor the component to use React hooks",
  "create a Dockerfile for the microservice",
  "implement the search functionality with Elasticsearch",
  "add pagination to the API endpoint",
  "debug memory leak in the Node.js process",
  "write documentation for the API endpoints",
  "set up the staging environment",
  "fix the CSS layout issue on mobile",
  "implement real-time updates with Server-Sent Events",
  "add input validation to the form",
  "optimize the build pipeline to reduce bundle size",
  "refactor the state management to use Zustand",
  "fix the flaky test in the integration suite",
  "add dark mode support to the dashboard",
  "implement the webhook handler",
  // Retry-like prompts (similar to previous)
  "fix the auth middleware to handle expired tokens gracefully",
  "fix the auth middleware - still getting 401 on valid tokens",
  "refactor the component to use React hooks properly",
  "refactor the component to use React hooks - useEffect cleanup",
  "optimize the query that's causing slow page loads on dashboard",
  "debug memory leak in the Node.js process - heap snapshot analysis",
  "debug memory leak in the Node.js process - found the leak in event listeners",
];

const MODELS = [
  "claude-sonnet-4-20250514",
  "claude-sonnet-4-20250514",
  "claude-sonnet-4-20250514",
  "claude-sonnet-4-20250514",
  "claude-sonnet-4-20250514",
  "claude-opus-4-20250514",
  "claude-opus-4-20250514",
  "claude-haiku-3-5-20241022",
];

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (rand() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateDate(baseDate: Date, offsetDays: number): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

function generateTimestamp(date: string, hour: number, minute?: number): string {
  const min = minute ?? randInt(0, 59);
  const sec = randInt(0, 59);
  return `${date}T${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}.000Z`;
}

function generateToolUseContent(count: number): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  for (let i = 0; i < count; i++) {
    const tool = pick(TOOL_NAMES);
    blocks.push({
      type: "tool_use",
      id: `toolu_${uuid().substring(0, 12)}`,
      name: tool,
      input: {},
    });
    if (tool === "Agent") {
      // Agent tools count as sidechain triggers
      blocks.push({
        type: "text",
        text: "Launching subagent to handle this task...",
      });
    }
  }
  if (rand() > 0.3) {
    blocks.unshift({
      type: "text",
      text: "I'll help you with that. Let me look at the code first.",
    });
  }
  return blocks;
}

export function generateDemoData(): ParsedData {
  const endDate = new Date("2025-03-15");
  const startOffset = -45; // 45 days of data
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() + startOffset);

  // --- Generate dailyActivity ---
  const dailyActivity = [];
  const hourCounts: Record<string, number> = {};

  // Night owl profile: heavy 9pm-2am, moderate afternoon, light morning
  const hourWeights = [
    35, 28, 18, 8, 3, 1, 2, 5, 12, 18, 22, 25, 20, 24, 28, 30, 25, 22, 28, 35, 42, 55, 62, 48,
  ];

  for (let h = 0; h < 24; h++) {
    hourCounts[h.toString()] = Math.round(hourWeights[h] * (1.5 + rand()));
  }

  // Skip some days for realism (weekends, gaps)
  const skipDays = new Set([3, 4, 12, 13, 19, 26, 27, 33, 34, 40]);
  const activeDatesList: string[] = [];

  for (let d = 0; d <= Math.abs(startOffset); d++) {
    const date = generateDate(startDate, d);
    if (skipDays.has(d)) continue;

    activeDatesList.push(date);
    const msgCount = randInt(8, 85);
    const sessCount = randInt(1, 6);
    const toolCount = randInt(5, 120);

    dailyActivity.push({
      date,
      messageCount: msgCount,
      sessionCount: sessCount,
      toolCallCount: toolCount,
    });
  }

  // --- Model usage ---
  const modelUsage: Record<string, {
    inputTokens: number;
    outputTokens: number;
    cacheReadInputTokens: number;
    cacheCreationInputTokens: number;
    webSearchRequests: number;
    costUSD: number;
    contextWindow: number;
    maxOutputTokens: number;
  }> = {
    "claude-sonnet-4-20250514": {
      inputTokens: 12_450_000,
      outputTokens: 4_280_000,
      cacheReadInputTokens: 38_900_000,
      cacheCreationInputTokens: 2_100_000,
      webSearchRequests: 12,
      costUSD: 89.45,
      contextWindow: 200000,
      maxOutputTokens: 16384,
    },
    "claude-opus-4-20250514": {
      inputTokens: 3_800_000,
      outputTokens: 1_950_000,
      cacheReadInputTokens: 8_200_000,
      cacheCreationInputTokens: 620_000,
      webSearchRequests: 3,
      costUSD: 156.20,
      contextWindow: 200000,
      maxOutputTokens: 32768,
    },
    "claude-haiku-3-5-20241022": {
      inputTokens: 980_000,
      outputTokens: 320_000,
      cacheReadInputTokens: 4_500_000,
      cacheCreationInputTokens: 180_000,
      webSearchRequests: 0,
      costUSD: 4.80,
      contextWindow: 200000,
      maxOutputTokens: 8192,
    },
  };

  const statsCache: StatsCache = {
    version: 1,
    lastComputedDate: endDate.toISOString().split("T")[0],
    dailyActivity,
    dailyModelTokens: dailyActivity.map((d) => ({
      date: d.date,
      tokensByModel: {
        "claude-sonnet-4-20250514": randInt(80000, 350000),
        "claude-opus-4-20250514": randInt(20000, 120000),
        "claude-haiku-3-5-20241022": randInt(5000, 40000),
      },
    })),
    modelUsage,
    totalSessions: 187,
    totalMessages: 6021,
    longestSession: {
      sessionId: uuid(),
      duration: 4_320_000,
      messageCount: 142,
      timestamp: generateTimestamp(activeDatesList[20], 23),
    },
    firstSessionDate: activeDatesList[0],
    hourCounts,
    totalSpeculationTimeSavedMs: 342_000,
  };

  // --- Generate history entries ---
  const history: HistoryEntry[] = [];
  let promptIdx = 0;

  for (const date of activeDatesList) {
    const sessionCount = randInt(2, 7);
    for (let s = 0; s < sessionCount; s++) {
      const sessId = uuid();
      const project = pick(DEMO_PROJECTS);
      const hour = pick([22, 23, 0, 1, 14, 15, 16, 21, 20, 10, 11, 22, 23]);
      const promptCount = randInt(1, 4);

      for (let p = 0; p < promptCount; p++) {
        const prompt = DEMO_PROMPTS[promptIdx % DEMO_PROMPTS.length];
        promptIdx++;
        const ts = new Date(generateTimestamp(date, (hour + Math.floor(p / 3)) % 24, p * 4 + randInt(0, 3)));

        history.push({
          display: prompt,
          pastedContents: {},
          timestamp: ts.getTime(),
          project,
          sessionId: sessId,
        });
      }
    }
  }

  // --- Generate session data ---
  const sessions: SessionData[] = [];
  const sessionGroups = new Map<string, HistoryEntry[]>();

  for (const entry of history) {
    if (!sessionGroups.has(entry.sessionId)) {
      sessionGroups.set(entry.sessionId, []);
    }
    sessionGroups.get(entry.sessionId)!.push(entry);
  }

  for (const [sessionId, entries] of sessionGroups) {
    const messages: SessionMessage[] = [];
    const project = entries[0].project;
    const branch = pick(DEMO_BRANCHES);

    for (const entry of entries) {
      const ts = new Date(entry.timestamp).toISOString();
      const model = pick(MODELS);
      const toolCount = randInt(1, 5);
      const isSidechain = rand() < 0.12;

      // User message
      messages.push({
        parentUuid: messages.length > 0 ? messages[messages.length - 1].uuid : null,
        isSidechain: false,
        type: "user",
        timestamp: ts,
        uuid: uuid(),
        cwd: `/Users/demo/projects/${project}`,
        gitBranch: branch,
        message: {
          role: "user",
          content: entry.display,
        },
      });

      // Assistant response
      const responseTs = new Date(entry.timestamp + randInt(3000, 45000)).toISOString();
      const stopReason = rand() < 0.72 ? "tool_use" : "end_turn";
      const content = generateToolUseContent(toolCount);

      messages.push({
        parentUuid: messages[messages.length - 1].uuid,
        isSidechain,
        type: "assistant",
        timestamp: responseTs,
        uuid: uuid(),
        cwd: `/Users/demo/projects/${project}`,
        gitBranch: branch,
        message: {
          role: "assistant",
          content,
          model,
          id: `msg_${uuid().substring(0, 12)}`,
          type: "message",
          stop_reason: stopReason,
          usage: {
            input_tokens: randInt(800, 12000),
            output_tokens: randInt(200, 4000),
            cache_read_input_tokens: randInt(5000, 80000),
          },
        },
      });

      // If tool_use, add follow-up tool results and another assistant response
      if (stopReason === "tool_use" && rand() < 0.6) {
        const followUpTs = new Date(entry.timestamp + randInt(45000, 90000)).toISOString();
        messages.push({
          parentUuid: messages[messages.length - 1].uuid,
          isSidechain: false,
          type: "assistant",
          timestamp: followUpTs,
          uuid: uuid(),
          cwd: `/Users/demo/projects/${project}`,
          gitBranch: branch,
          message: {
            role: "assistant",
            content: [
              { type: "text", text: "Done. The changes have been applied." },
            ],
            model,
            id: `msg_${uuid().substring(0, 12)}`,
            type: "message",
            stop_reason: "end_turn",
            usage: {
              input_tokens: randInt(2000, 15000),
              output_tokens: randInt(100, 2000),
              cache_read_input_tokens: randInt(10000, 100000),
            },
          },
        });
      }
    }

    sessions.push({
      sessionId,
      projectPath: project,
      messages,
    });
  }

  return {
    statsCache,
    history,
    sessions,
  };
}
