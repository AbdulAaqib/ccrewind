import fs from "fs/promises";
import path from "path";
import os from "os";
import { ParsedData, StatsCache, HistoryEntry, SessionMessage, SessionData } from "@/types";

const CLAUDE_DIR = path.join(os.homedir(), ".claude");
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jsonl$/;
const BATCH_SIZE = 10;

export async function claudeFolderExists(): Promise<boolean> {
  try {
    await fs.access(CLAUDE_DIR);
    return true;
  } catch {
    return false;
  }
}

export async function parseClaudeFolderFromFS(): Promise<ParsedData> {
  const result: ParsedData = {
    statsCache: null,
    history: [],
    sessions: [],
  };

  // Parse stats-cache.json
  try {
    const text = await fs.readFile(path.join(CLAUDE_DIR, "stats-cache.json"), "utf-8");
    result.statsCache = JSON.parse(text) as StatsCache;
  } catch {
    // File may not exist
  }

  // Parse history.jsonl
  try {
    const text = await fs.readFile(path.join(CLAUDE_DIR, "history.jsonl"), "utf-8");
    const lines = text.trim().split("\n").filter(Boolean);
    result.history = lines.map((line) => JSON.parse(line) as HistoryEntry);
  } catch {
    // File may not exist
  }

  // Parse session JSONL files from projects/<project>/<session>.jsonl
  const projectsDir = path.join(CLAUDE_DIR, "projects");
  let projectDirs: string[] = [];
  try {
    const entries = await fs.readdir(projectsDir, { withFileTypes: true });
    projectDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    // projects/ may not exist
    return result;
  }

  // Collect all session files
  const sessionFiles: Array<{ filePath: string; projectPath: string; fileName: string }> = [];
  for (const projectDir of projectDirs) {
    try {
      const files = await fs.readdir(path.join(projectsDir, projectDir));
      for (const fileName of files) {
        if (UUID_REGEX.test(fileName)) {
          sessionFiles.push({
            filePath: path.join(projectsDir, projectDir, fileName),
            projectPath: projectDir,
            fileName,
          });
        }
      }
    } catch {
      // Skip unreadable project dirs
    }
  }

  // Process in batches of 10
  for (let i = 0; i < sessionFiles.length; i += BATCH_SIZE) {
    const batch = sessionFiles.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async ({ filePath, projectPath, fileName }): Promise<SessionData | null> => {
        try {
          const text = await fs.readFile(filePath, "utf-8");
          const lines = text.trim().split("\n").filter(Boolean);
          const messages = lines.map((line) => JSON.parse(line) as SessionMessage);
          const sessionId = fileName.replace(".jsonl", "");
          return { sessionId, projectPath, messages };
        } catch {
          return null;
        }
      })
    );

    for (const session of batchResults) {
      if (session && session.messages.length > 0) {
        result.sessions.push(session);
      }
    }
  }

  return result;
}
