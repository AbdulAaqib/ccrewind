#!/usr/bin/env python3
"""
Generate true-color ANSI half-block art for all character mascots and write to
scripts/mascots-ansi.ts. Run from repo root:

    python3 scripts/generate-mascot-art.py

Requires: Pillow  (pip install pillow)
"""

import json
import math
import os
import sys
from collections import deque

try:
    from PIL import Image
except ImportError:
    print("Error: Pillow is required. Run: pip install pillow")
    sys.exit(1)

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MASCOTS_DIR = os.path.join(REPO_ROOT, "public", "mascots")
OUTPUT_FILE = os.path.join(REPO_ROOT, "scripts", "mascots-ansi.ts")

WIDTH = 56
HEIGHT = 28
BG_THRESH = 35  # euclidean distance for flood-fill background detection

CHAR_MAP: dict[str, str] = {
    "The Intern": "char-the-intern.png",
    "The Degen": "char-the-degen.png",
    "The SBF": "char-the-ghost.png",
    "The Sama": "char-the-operator.png",
    "The Quant": "char-the-quant.png",
    "The Musk": "char-the-chaos-agent.png",
    "The Dario": "char-the-visionary.png",
    "The Karpathy": "char-the-night-shift-engineer.png",
    "Slough Boy": "char-the-researcher.png",
}

ESC = "\x1b"
RESET = f"{ESC}[0m"


def detect_bg(img: Image.Image) -> tuple:
    w, h = img.size
    samples = [img.getpixel((x, y)) for x, y in [
        (0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (0, h // 2)
    ]]
    return tuple(sum(s[i] for s in samples) // len(samples) for i in range(3))


def color_dist(a: tuple, b: tuple) -> float:
    return math.sqrt(sum((a[i] - b[i]) ** 2 for i in range(3)))


def make_bg_mask(img: Image.Image, bg: tuple, thresh: float) -> list[list[bool]]:
    """
    Flood fill from all edge pixels that match the background colour.
    Only pixels *connected* to the edges are marked transparent — dark pixels
    inside the character are preserved even if they're close to the bg colour.
    """
    w, h = img.size
    visited = [[False] * h for _ in range(w)]
    queue: deque = deque()

    def seed(x: int, y: int) -> None:
        if not visited[x][y] and color_dist(img.getpixel((x, y)), bg) < thresh:
            visited[x][y] = True
            queue.append((x, y))

    for x in range(w):
        seed(x, 0)
        seed(x, h - 1)
    for y in range(h):
        seed(0, y)
        seed(w - 1, y)

    while queue:
        x, y = queue.popleft()
        for nx, ny in [(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)]:
            if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                if color_dist(img.getpixel((nx, ny)), bg) < thresh:
                    visited[nx][ny] = True
                    queue.append((nx, ny))

    return visited


def img_to_ansi(path: str) -> str:
    img = Image.open(path).convert("RGB")
    bg = detect_bg(img)
    orig_w, orig_h = img.size
    mask = make_bg_mask(img, bg, BG_THRESH)

    img = img.resize((WIDTH, HEIGHT * 2), Image.LANCZOS)
    sx, sy = orig_w / WIDTH, orig_h / (HEIGHT * 2)

    def is_bg(col: int, prow: int) -> bool:
        ox = min(int(col * sx), orig_w - 1)
        oy = min(int(prow * sy), orig_h - 1)
        return mask[ox][oy]

    lines = []
    for row in range(HEIGHT):
        parts: list[str] = []
        cur_fg = cur_bg = None
        for col in range(WIDTH):
            tp = img.getpixel((col, row * 2))
            bp = img.getpixel((col, row * 2 + 1))
            tc = None if is_bg(col, row * 2) else tp
            bc = None if is_bg(col, row * 2 + 1) else bp

            if tc is None and bc is None:
                if cur_fg is not None or cur_bg is not None:
                    parts.append(RESET)
                    cur_fg = cur_bg = None
                parts.append(" ")
                continue

            if tc is not None and bc is not None:
                new_fg, new_bg, char = bc, tc, "▄"
            elif tc is not None:
                new_fg, new_bg, char = tc, None, "▀"
            else:
                new_fg, new_bg, char = bc, None, "▄"

            seq = ""
            if new_bg != cur_bg:
                if new_bg is None:
                    seq += f"{ESC}[49m"
                else:
                    seq += f"{ESC}[48;2;{new_bg[0]};{new_bg[1]};{new_bg[2]}m"
                cur_bg = new_bg
            if new_fg != cur_fg:
                seq += f"{ESC}[38;2;{new_fg[0]};{new_fg[1]};{new_fg[2]}m"
                cur_fg = new_fg
            parts.append(seq + char)

        parts.append(RESET)
        lines.append("".join(parts))

    return "\n".join(lines)


def main() -> None:
    results: dict[str, str] = {}
    total_bytes = 0
    for name, filename in CHAR_MAP.items():
        path = os.path.join(MASCOTS_DIR, filename)
        if not os.path.exists(path):
            print(f"  WARNING: missing {path}")
            continue
        print(f"  Processing {name}...", flush=True)
        art = img_to_ansi(path)
        results[name] = art
        size = len(art.encode("utf-8"))
        total_bytes += size
        print(f"    → {size // 1024}KB")

    print(f"\nTotal: {total_bytes // 1024}KB")

    ts_lines = [
        "// AUTO-GENERATED by scripts/generate-mascot-art.py — do not edit manually",
        "// Pre-rendered true-color ANSI half-block art (90×45, flood-fill transparent bg)",
        "// To regenerate: python3 scripts/generate-mascot-art.py",
        "",
        "export const MASCOT_ART: Record<string, string> = {",
    ]
    for name, art in results.items():
        escaped = art.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
        ts_lines.append(f"  {json.dumps(name)}: `{escaped}`,")
        ts_lines.append("")
    ts_lines.append("};\n")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(ts_lines))

    print(f"Written: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
