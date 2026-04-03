# Claude Code Rewind

> There's no way to see your Claude Code usage. We changed that. Your developer archetype. Your token costs. Your Claude ELO. Nobody else has touched this data. Find out where you actually stand.

Upload your `~/.claude` folder. Get a personalised story of your usage. Find out your archetype. Get your Claude Elo. Everything runs in the browser - zero data leaves your machine.

**Live:** [ccrewind.com](https://ccrewind.com) &nbsp;|&nbsp; **Releases:** [github.com/Junaid2005/ccrewind/releases](https://github.com/Junaid2005/ccrewind/releases)

[![CI](https://github.com/Junaid2005/ccrewind/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Junaid2005/ccrewind/actions/workflows/ci.yml)
[![Vercel](https://therealsujitk-vercel-badge.vercel.app/?app=ccrewind)](https://ccrewind.com)

---

## What it does

Claude Code Rewind analyses your local Claude Code history and turns it into a full-screen story experience - 14 slides, each with a stat, a narrative, an animated chart, and a mascot. It ends with a character reveal and a mega score out of 1000.

### The slides

| # | Slide | What it shows |
|---|-------|---------------|
| 1 | Graveyard Shift | When you code - 24h radial clock heatmap |
| 2 | The Delegator | How much you use agents - force-directed bubble chart |
| 3 | Top Projects | Your top 3 repos by messages, tokens, sessions |
| 4 | The Arsenal | Which tools Claude used most - animated bars |
| 5 | Token Furnace | Total tokens consumed - canvas slot machine reveal |
| 6 | Loyalty Test | Which model you stick to - racing bars |
| 7 | Thinking Hours | How long Claude thought on your behalf - EKG brainwave |
| 8 | Commit History | Project activity over time - GitHub-style heatmap |
| 9 | Sharpshooter | Prompt length vs follow-ups - scatter quadrant |
| 10 | The Streak | Consistency calendar |
| 11 | Stop Reason | tool_use vs end_turn split |
| 12 | Retry Spiral | How often you re-prompt - Archimedean spiral |
| 13 | Power Score | Claude Elo out of 1000 |
| 14 | Character Reveal | Your archetype - confetti, mascot, one-liner |

After the slides: a **ShareCard** carousel with 6 downloadable cards (character + 5 stats variants), a full-screen **Dashboard** with every stat in one screenshottable page, and a cinematic **Credits** page.

### The archetypes

9 characters assigned based on your Claude Elo score:

> The Quant · The Dario · The Degen · The Karpathy · The Musk · The Sama · The SBF · Slough Boy · The Intern

### Claude Elo

Score out of 1000, 9 components:

```
Precision Index    150pts   avg prompt length + end_turn ratio
Depth Score        150pts   avg messages per session
Consistency        100pts   streak / active days ratio
Loyalty Bonus      100pts   single model usage
Completion Rate    150pts   sessions vs active days
Velocity Score     100pts   messages per session
Topic Breadth      100pts   number of projects
Night Bonus         50pts   🔒 easter egg - peak usage after midnight
Streak Bonus       100pts   longest consecutive day streak
─────────────────────────
Max                1000pts
```

---

## /ccrewind — Terminal report

A terminal stats report that runs directly in your Claude Code session via a slash command. No browser needed.

```
┌──────────────────────────────────────────────────┐
│             ◆ CC REWIND ◆ REPORT                 │
│                ccrewind.com                      │
└──────────────────────────────────────────────────┘

  COST & MODELS
  Total spend: $47.23
  claude-sonnet-4-5  ████████████████░░░░  77%  $36.41
  claude-opus-4-5    ████░░░░░░░░░░░░░░░░  18%  $8.61

  TOP PROJECTS
  ccrewind           ██████████████░░░░  $18.40
  ai-side-project    █████████░░░░░░░░░  $11.20

  ...character reveal, streak calendar, Claude Elo...
```

### Install

```bash
npx ccrewind --setup
```

This copies the report script to `~/.local/share/ccrewind/` and registers two Claude Code slash commands. After setup:

| Command | What it does |
|---------|-------------|
| `/ccrewind` | Runs the terminal stats report inline |
| `/ccrewind-ui` | Starts the web UI with `~/.claude` auto-detected (requires local repo clone) |

Or run without installing:

```bash
npx ccrewind          # terminal report
npx ccrewind --gui    # open web UI (requires local repo clone)
```

### What it shows

| Section | Content |
|---------|---------|
| Cost & Models | Total spend, per-model breakdown with cost |
| Top Projects | Top 5 repos by estimated cost |
| Token Usage | Input / Output / Cache Read / Cache Write with bars |
| Top Tools | Most-used Claude tools |
| Activity by Hour | 24-hour sparkline, peak hour callout |
| Streak | 7×7 calendar grid, longest + current streak |
| Birthday | First session date |
| Character | Your archetype, one-liner, Claude Elo |

All data read from `~/.claude` — nothing leaves your machine.

---

## How it works

### Data flow

```
~/.claude folder (local, never uploaded)
        │
        ├── stats-cache.json   pre-aggregated totals, hour counts, model usage
        ├── history.jsonl      one line per user prompt, project path, timestamp
        └── projects/
              └── <slug>/
                    └── <session>.jsonl   full message transcripts
        │
        ▼
┌──────────────────────────────────┐
│  parser.ts                       │
│  reads all three sources,        │
│  normalises slug paths to real   │
│  paths via slugToPath map        │
└──────────────┬───────────────────┘
               │  ParsedData
               ▼
┌──────────────────────────────────┐
│  stats.ts                        │
│  50+ computed fields             │
│  RSI clustering (Jaccard sim)    │
│  streak calculation              │
│  per-project token/session agg   │
└──────┬───────────────┬───────────┘
       │               │
       ▼               ▼
┌─────────────┐  ┌─────────────┐
│ narratives  │  │  scoring    │
│ archetypes  │  │             │
│             │  │ EloBreakdown│
│ SlideNarr.  │  └─────────────┘
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│  SlideContainer                              │
│  14 slides, tap/keyboard to advance          │
│  → PowerScore → CharacterReveal             │
│  → ShareCard → Dashboard (fullscreen)        │
└──────────────────────────────────────────────┘
```

### Parsing priority

```
1. stats-cache.json     fastest - use for totals, model usage, hour counts
2. history.jsonl        user prompts, timestamps, project paths (real paths)
3. projects/**/*.jsonl  tokens per message, tool calls, stop_reason, branches
```

### Project path normalisation

`history.jsonl` stores project as real paths: `/home/user/dev/ccrewind`
Session folder names are slugified: `-home-user-dev-ccrewind`

`stats.ts` builds a `slugToPath` lookup at parse time so both sources merge under one key. Both `totalMessages` and per-project message counts use session JSONLs (user + assistant messages). Tokens and session counts come from session files via the resolved path.

### Sharing

The share flow generates a compact URL (`/share?d=...`) encoding 13 dot-separated stats + a username suffix. The share page renders two cards side by side (character card + dev stats card) with credits at the bottom. Cards can also be downloaded as PNG via `html-to-image`.

### Tech stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind v4 with `@theme` tokens |
| Animation | Framer Motion |
| Charts | D3 (radial clock, bubbles, heatmaps, scatter, spiral) |
| Canvas | Slot machine (TokenFurnace), EKG brainwave (ThinkingHours) |
| Deploy | Vercel |

---

## Getting started

### Option 1 — Terminal report (fastest)

```bash
npx ccrewind
```

Runs immediately. No browser, no install. Add `--setup` to also register the `/ccrewind` Claude Code slash command:

```bash
npx ccrewind --setup
```

After setup, type `/ccrewind` inside any Claude Code session.

### Option 2 — Run locally (recommended for privacy)

```bash
git clone https://github.com/Junaid2005/ccrewind
cd ccrewind
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Your `~/.claude` folder is **auto-detected** — no upload needed. Just click **Use your local data** and you're in.

### Option 3 — Use the live site

Go to [ccrewind.com](https://ccrewind.com) and drop your `~/.claude` folder via the file picker, or click **Try Demo**.

### Finding your .claude folder (it's hidden)

| OS | How to show hidden files |
|----|--------------------------|
| macOS | `Cmd + Shift + .` in the file picker |
| Windows | View → Show → Hidden items |
| Linux | `Ctrl + H` in file manager |

Your folder is at `~/.claude` - e.g. `/Users/yourname/.claude` or `/home/yourname/.claude`.

---

## DevOps

### CI pipeline

Runs on every push to `main` and every pull request.

```
push or PR to main
        │
        ▼
┌────────────────────────────────────────────┐
│               CI Pipeline                  │
│                                            │
│  npm ci          install frozen deps       │
│      │                                     │
│      ▼                                     │
│  Prettier        format check              │
│      │                                     │
│      ▼                                     │
│  ESLint          code quality              │
│      │                                     │
│      ▼                                     │
│  Jest            unit tests                │
│      │                                     │
│      ▼                                     │
│  next build      type check + prod build   │
│      │                                     │
│      ▼                                     │
│  esbuild         build:tui npm bundle      │
│                                            │
│  Any failure blocks merge.                 │
└────────────────────────────────────────────┘
```

### Release pipeline

Versioning convention:

1. Bump `package.json` → `"version": "X.Y.Z"` manually.
2. Commit: `chore: bump version to X.Y.Z`
3. Tag and push:

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

```
git push v* tag
        │
        ▼
┌────────────────────────────────────────────┐
│             Release Pipeline               │
│                                            │
│  (same checks as CI)                       │
│  Prettier → ESLint → Jest → next build     │
│      → build:tui                           │
│      │                                     │
│      ▼                                     │
│  GitHub Release created                    │
│  auto-generated changelog from commits     │
│  marked as Latest                          │
│      │                                     │
│      ▼                                     │
│  npm publish (auto, via NPM_TOKEN secret)  │
│      │                                     │
│      ▼                                     │
│  Vercel deploys automatically              │
│                                            │
│  Release blocked if any check fails.       │
└────────────────────────────────────────────┘
```

To set up npm auto-publish on a fork: add an `NPM_TOKEN` secret under **Settings → Secrets and variables → Actions**.

Releases: [github.com/Junaid2005/ccrewind/releases](https://github.com/Junaid2005/ccrewind/releases)

### Tests

Tests across 4 suites:

```
__tests__/
  scoring.test.ts      Elo calculation, component caps, night bonus, loyalty
  archetypes.test.ts   character assignment logic, determinism, known name set
  narratives.test.ts   all archetype label tiers across all slides
  stats.test.ts        parser output, slug→path normalisation, token counts
```

```bash
npm test              # run all tests
npm run lint          # ESLint
npm run format        # Prettier (auto-fix)
npm run format:check  # Prettier (CI mode)
npm run build         # type check + production build
npm run build:tui     # bundle terminal CLI to dist/ccrewind-tui.mjs
npm run setup:command # install /ccrewind slash command from local build
```

### Observability

We track what matters at the build and deploy layer - not at runtime.

| Signal | Where |
|--------|-------|
| Build status | GitHub Actions - every PR gets a pass/fail |
| Test results | Jest - unit tests printed in CI logs |
| Type errors | TypeScript strict mode - build fails on any type error |
| Format drift | Prettier check in CI - consistent style enforced across all contributors |
| Release changelog | Auto-generated from commits on every `v*` tag |
| Deployment logs | Vercel dashboard - build output, edge runtime warnings, function logs per deployment |

Zero runtime telemetry is collected. All user data stays in the browser. Observability is entirely at the build and deploy layer, not in the product.

---

## What this is - and where it goes

### The problem with Claude Code usage data

There is no API for Claude Code usage data. No dashboard, no export button, no analytics endpoint. Unless you are an enterprise customer with admin access, the only record of your usage is the raw local files that Claude Code writes to `~/.claude` - `stats-cache.json`, `history.jsonl`, and per-session JSONL transcripts. Nobody has built anything on top of this yet.

Claude Code Rewind is a proof of concept that shows what is possible when you actually read those files.

### What we built

A fun, story-driven experience. Spotify Wrapped for developers. The goal was to make people *feel* their data rather than read a table. Every metric has an archetype. Every stat has a one-liner. The charts are weird on purpose - radial clocks, Archimedean spirals, slot machines - because the default chart types are boring and the data deserves better.

It runs entirely in the browser. Zero backend, zero telemetry, zero infrastructure costs. You drop a folder, you get a story.

### Where this goes next

This was version one. The fun version. The "what can you even do with this data" version.

**What's already shipped:** The terminal CLI (`npx ccrewind`) now shows cost per project and cost per model — not just token counts but actual spend in dollars. The data is all there in `~/.claude`, and we surface it: "you spent $47 on ccrewind, $23 on your AI side project, $12 on university work."

**Planned extensions:**

| Feature | What it enables |
|---------|-----------------|
| `/ccrewind-ui` slash command | Open ccrewind.com pre-loaded with your data from Claude Code |
| Weekly/monthly spend trends | Identify your most expensive sessions |
| Cost efficiency score | Tokens per useful output — are you getting value? |
| Team dashboards | Aggregate across multiple `~/.claude` exports (enterprise) |
| Budget alerts | Warn when a project exceeds a token or cost threshold |
| GIF integration | Walid's mascot animations wired into every slide |

For enterprise customers who *do* have API access to usage data, the same frontend could be powered by a real-time backend instead of a folder drop. The visualisation layer doesn't change. The data pipeline does.

---

## Contributors

| Contributor | Role |
|-------------|------|
| [Junaid](https://github.com/Junaid2005) | Engineering, product, data pipeline |
| [Abdul](https://github.com/AbdulAaqib) | Development, slides, product & vision |
| [Walid](https://github.com/samouneh) | Design, mascot GIFs, character art |

---

## Privacy

100% client-side. Your `~/.claude` data is read in the browser and never sent anywhere. No backend, no analytics, no telemetry.

---

## Licence

MIT
