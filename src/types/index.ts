export interface HistoryEntry {
  display: string;
  pastedContents: Record<string, unknown>;
  timestamp: number;
  project: string;
  sessionId: string;
}

export interface DailyActivity {
  date: string;
  messageCount: number;
  sessionCount: number;
  toolCallCount: number;
}

export interface DailyModelTokens {
  date: string;
  tokensByModel: Record<string, number>;
}

export interface ModelUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadInputTokens: number;
  cacheCreationInputTokens: number;
  webSearchRequests: number;
  costUSD: number;
  contextWindow: number;
  maxOutputTokens: number;
}

export interface LongestSession {
  sessionId: string;
  duration: number;
  messageCount: number;
  timestamp: string;
}

export interface StatsCache {
  version: number;
  lastComputedDate: string;
  dailyActivity: DailyActivity[];
  dailyModelTokens: DailyModelTokens[];
  modelUsage: Record<string, ModelUsage>;
  totalSessions: number;
  totalMessages: number;
  longestSession: LongestSession;
  firstSessionDate: string;
  hourCounts: Record<string, number>;
  totalSpeculationTimeSavedMs: number;
}

export interface SessionMessage {
  parentUuid: string | null;
  isSidechain: boolean;
  type: "user" | "assistant" | "system" | "progress" | "file-history-snapshot" | "last-prompt";
  timestamp: string;
  uuid: string;
  cwd?: string;
  gitBranch?: string;
  sessionId?: string;
  version?: string;
  entrypoint?: string;
  userType?: string;
  message?: {
    role: string;
    content: ContentBlock[] | string;
    model?: string;
    id?: string;
    type?: string;
    stop_reason?: string | null;
    stop_sequence?: string | null;
    usage?: {
      input_tokens: number;
      output_tokens: number;
      cache_read_input_tokens?: number;
      cache_creation_input_tokens?: number;
      service_tier?: string;
    };
  };
  data?: Record<string, unknown>;
}

export interface ContentBlock {
  type: "text" | "tool_use" | "tool_result" | "thinking";
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  content?: unknown;
  thinking?: string;
}

export interface ParsedData {
  statsCache: StatsCache | null;
  history: HistoryEntry[];
  sessions: SessionData[];
}

export interface SessionData {
  sessionId: string;
  projectPath: string;
  messages: SessionMessage[];
}

export interface ComputedStats {
  hourDistribution: number[];
  peakHour: number;
  peakHourCount: number;
  totalMessages: number;
  sidechainMessages: number;
  sidechainRatio: number;
  agentToolCalls: number;
  toolCounts: Record<string, number>;
  topTools: Array<{ name: string; count: number }>;
  totalToolCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheReadTokens: number;
  totalCacheCreationTokens: number;
  totalTokens: number;
  modelCounts: Record<string, number>;
  primaryModel: string;
  primaryModelPercentage: number;
  modelCount: number;
  estimatedThinkingTimeMs: number;
  avgResponseTimeMs: number;
  maxResponseTimeMs: number;
  uniqueProjects: string[];
  uniqueBranches: string[];
  projectCount: number;
  branchCount: number;
  projectActivity: Record<string, number>;
  avgPromptLength: number;
  avgMessagesPerSession: number;
  medianPromptLength: number;
  longestStreak: number;
  currentStreak: number;
  totalActiveDays: number;
  dailyActivity: DailyActivity[];
  activeDates: string[];
  stopReasonCounts: Record<string, number>;
  toolUseRatio: number;
  endTurnRatio: number;
  totalSessions: number;
  firstSessionDate: string;
  lastSessionDate: string;
  daysActive: number;
  longestSessionMessages: number;
  longestSessionDurationMs: number;
  retrySpiral: number;
  retryClusters: number;
  totalRetries: number;
}

export interface Character {
  name: string;
  oneLiner: string;
  endingLine: string;
  description: string;
}

export interface CPSBreakdown {
  precisionIndex: number;
  depthScore: number;
  consistency: number;
  loyaltyBonus: number;
  completionRate: number;
  velocityScore: number;
  topicBreadth: number;
  nightBonus: number;
  streakBonus: number;
  total: number;
}
