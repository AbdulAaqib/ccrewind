import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { decodeShareData } from "@/lib/share";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const d = request.nextUrl.searchParams.get("d");
  const data = d ? decodeShareData(d) : null;

  if (!data) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#262624",
            color: "#faf9f5",
            fontSize: 48,
            fontWeight: 800,
          }}
        >
          Claude Code Rewind
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const pills: string[] = [];
  if (data.peakHour >= 22 || data.peakHour <= 4) pills.push("Night Owl");
  if (data.longestStreak > 7) pills.push(`${data.longestStreak}-day streak`);
  if (data.primaryModelPct > 80) pills.push(`${data.primaryModelPct}% loyal`);
  if (data.totalMessages > 500) pills.push(`${data.totalMessages.toLocaleString()} msgs`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#262624",
          padding: "60px",
          gap: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: "0.2em",
            color: "#ff6b35",
            textTransform: "uppercase",
          }}
        >
          CC REWIND
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 800,
            color: "#faf9f5",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          {data.name}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#d3d2ce",
            fontStyle: "italic",
            textAlign: "center",
            maxWidth: "800px",
          }}
        >
          &ldquo;{data.oneLiner}&rdquo;
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "12px",
            marginTop: "16px",
          }}
        >
          <span style={{ fontSize: 80, fontWeight: 800, color: "#ff6b35" }}>
            {data.cps}
          </span>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#97908a",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            CPS
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          {pills.slice(0, 3).map((pill) => (
            <span
              key={pill}
              style={{
                backgroundColor: "#383835",
                border: "1px solid rgba(250, 249, 245, 0.05)",
                borderRadius: "9999px",
                padding: "8px 20px",
                fontSize: 14,
                fontWeight: 700,
                color: "#97908a",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {pill}
            </span>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 18,
            fontStyle: "italic",
            color: "rgba(255, 107, 53, 0.6)",
            marginTop: "12px",
          }}
        >
          {data.endingLine}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
