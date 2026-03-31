import { NextResponse } from "next/server";
import { claudeFolderExists } from "@/lib/server-parser";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ available: false });
  }

  const available = await claudeFolderExists();
  return NextResponse.json({ available });
}
