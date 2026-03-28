import { ParsedData, HistoryEntry, StatsCache, SessionData, SessionMessage } from "@/types";

export async function parseClaudeFolder(files: FileList): Promise<ParsedData> {
  const result: ParsedData = {
    statsCache: null,
    history: [],
    sessions: [],
  };

  const fileArray = Array.from(files);

  // Parse stats-cache.json first (fastest, pre-aggregated)
  const statsFile = fileArray.find((f) => f.name === "stats-cache.json");
  if (statsFile) {
    try {
      const text = await statsFile.text();
      result.statsCache = JSON.parse(text) as StatsCache;
    } catch (e) {
      console.warn("Failed to parse stats-cache.json:", e);
    }
  }

  // Parse history.jsonl
  const historyFile = fileArray.find((f) => f.name === "history.jsonl");
  if (historyFile) {
    try {
      const text = await historyFile.text();
      const lines = text.trim().split("\n").filter(Boolean);
      result.history = lines.map((line) => JSON.parse(line) as HistoryEntry);
    } catch (e) {
      console.warn("Failed to parse history.jsonl:", e);
    }
  }

  // Parse session JSONL files from projects/<project>/<session>.jsonl
  const sessionFiles = fileArray.filter((f) => {
    const parts = f.webkitRelativePath.split("/");
    return (
      parts.some((p) => p === "projects") &&
      f.name.endsWith(".jsonl") &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jsonl$/.test(f.name)
    );
  });

  const BATCH_SIZE = 10;
  for (let i = 0; i < sessionFiles.length; i += BATCH_SIZE) {
    const batch = sessionFiles.slice(i, i + BATCH_SIZE);
    const sessionPromises = batch.map(async (file) => {
      try {
        const text = await file.text();
        const lines = text.trim().split("\n").filter(Boolean);
        const messages = lines.map((line) => JSON.parse(line) as SessionMessage);

        const parts = file.webkitRelativePath.split("/");
        const projectsIdx = parts.indexOf("projects");
        const projectPath =
          projectsIdx >= 0 && projectsIdx + 1 < parts.length
            ? parts[projectsIdx + 1]
            : "unknown";

        const sessionId = file.name.replace(".jsonl", "");

        return { sessionId, projectPath, messages } as SessionData;
      } catch (e) {
        console.warn(`Failed to parse session ${file.name}:`, e);
        return null;
      }
    });

    const batchResults = await Promise.all(sessionPromises);
    for (const session of batchResults) {
      if (session && session.messages.length > 0) {
        result.sessions.push(session);
      }
    }
  }

  return result;
}
