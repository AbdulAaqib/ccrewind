import { NextResponse } from "next/server";
import { claudeFolderExists, parseClaudeFolderFromFS } from "@/lib/server-parser";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Local data access is only available in development mode" }, { status: 403 });
  }

  const exists = await claudeFolderExists();
  if (!exists) {
    return NextResponse.json({ error: "~/.claude folder not found" }, { status: 404 });
  }

  try {
    const data = await parseClaudeFolderFromFS();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to parse ~/.claude folder" },
      { status: 500 }
    );
  }
}
