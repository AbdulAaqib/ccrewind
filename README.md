# Claude Code Rewind

> There's no way to see your Claude Code usage. We changed that. Your developer archetype. Your token costs. Your Claude ELO. Nobody else has touched this data. Find out where you actually stand.

Upload your `~/.claude` folder. Get a personalised story of your usage. Find out your archetype. Get your Claude Power Score. Everything runs in the browser - zero data leaves your machine.

**Live:** [ccrewind.vercel.app](https://ccrewind.vercel.app) &nbsp;|&nbsp; **Releases:** [github.com/Junaid2005/ccrewind/releases](https://github.com/Junaid2005/ccrewind/releases)

[![CI](https://github.com/Junaid2005/ccrewind/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Junaid2005/ccrewind/actions/workflows/ci.yml)
[![Vercel](https://therealsujitk-vercel-badge.vercel.app/?app=ccrewind)](https://ccrewind.vercel.app)

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
| 13 | Power Score | Claude Power Score out of 1000 |
| 14 | Character Reveal | Your archetype - confetti, mascot, one-liner |

After the slides: a **ShareCard** carousel with 6 downloadable cards (character + 5 stats variants), a full-screen **Dashboard** with every stat in one screenshottable page, and a cinematic **Credits** page.

### The archetypes

9 characters assigned by hash-based selection from your usage patterns:

> The Quant · The Dario · The Degen · The Torvalds · The Musk · The Sama · The SBF · Slough Boy · The Intern

### Claude Power Score (CPS)

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
│             │  │ CPSBreakdown│
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

```bash
git clone https://github.com/Junaid2005/ccrewind
cd ccrewind
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and drop your `~/.claude` folder, or click **Try Demo**.

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
│  Jest            49 unit tests             │
│      │                                     │
│      ▼                                     │
│  next build      type check + prod build   │
│                                            │
│  Any failure blocks merge.                 │
└────────────────────────────────────────────┘
```

### Release pipeline

```bash
git tag v1.0.0
git push origin v1.0.0
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
│      │                                     │
│      ▼                                     │
│  GitHub Release created                    │
│  auto-generated changelog from commits     │
│  marked as Latest                          │
│      │                                     │
│      ▼                                     │
│  Vercel deploys automatically              │
│                                            │
│  Release blocked if any check fails.       │
└────────────────────────────────────────────┘
```

Releases: [github.com/Junaid2005/ccrewind/releases](https://github.com/Junaid2005/ccrewind/releases)

### Tests

49 tests across 4 suites:

```
__tests__/
  scoring.test.ts      CPS calculation, component caps, night bonus, loyalty
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
```

### Observability

We track what matters at the build and deploy layer - not at runtime.

| Signal | Where |
|--------|-------|
| Build status | GitHub Actions - every PR gets a pass/fail |
| Test results | Jest - 49 assertions, printed in CI logs |
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

The natural next step is cost. Right now we show token counts - input, output, cache. What we don't show yet is what those tokens *cost*. Anthropic publishes per-model pricing, and every session file has the model name and exact token counts. The math is straightforward:

```
cost = (input_tokens × input_price) + (output_tokens × output_price)
     + (cache_read_tokens × cache_read_price)
     + (cache_creation_tokens × cache_creation_price)
```

With that, Claude Code Rewind becomes something closer to a spending dashboard - not just "you used 500M tokens" but "you spent £47 on ccrewind, £23 on your AI side project, £12 on university work." Per project, per week, per model. The data is all there. Nobody has surfaced it yet.

**Planned extensions:**

| Feature | What it enables |
|---------|-----------------|
| Cost per project | See which repos are burning the most budget |
| Cost per model | See what Opus vs Sonnet actually costs you in practice |
| Weekly/monthly spend trends | Identify your most expensive sessions |
| Cost efficiency score | Tokens per useful output - are you getting value? |
| Team dashboards | Aggregate across multiple `~/.claude` exports (enterprise) |
| Budget alerts | Warn when a project exceeds a token or cost threshold |

The architecture is already there. The parser reads all the right fields. Adding cost is a config object of model prices and a multiplier at compute time - no new data sources needed.

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
