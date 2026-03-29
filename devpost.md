## Inspiration

I'm a third year degree apprentice in Software Engineering at Morgan Stanley, where my current project is focused on observability and data visualisation of the firm's file system. Outside of work, I've been using Claude Code heavily since December. Somewhere between the two, I became a bit obsessed with graphs, dashboards, and making data feel like something rather than just a table of numbers.

The question came naturally: can I get stats on my own Claude Code usage? Turns out, you can't. There's no API, no dashboard, no export. Unless you're an enterprise customer, you're blind. But Claude Code writes detailed local logs to `~/.claude` on every session. Nobody had built anything on top of them. So we did.

---

## What it does

Claude Code Rewind parses your local `~/.claude` folder entirely in the browser and turns your usage history into a story. 14 full-screen slides, each with a stat, a narrative written from your data, and a custom animated chart.

It ends with:
- **Your developer archetype** - one of 10 characters assigned by weighted scoring across your usage patterns
- **Your Claude ELO** - a score out of 1000 across 9 components
- **A full dashboard** - every metric in one screenshottable page

Every stat is computed client-side. Nothing leaves your machine.

---

## How we built it

| Layer | Tech |
|-------|------|
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Charts | D3.js, Canvas API |
| Deploy | Vercel |
| CI/CD | GitHub Actions, Jest, ESLint, Prettier |

The data pipeline reads three local sources in priority order:

1. `stats-cache.json` - pre-aggregated totals and model usage
2. `history.jsonl` - user prompts, timestamps, project paths
3. `projects/**/*.jsonl` - token counts, tool calls, stop reasons, git branches

One non-obvious problem: the two data sources use different formats for project paths. `history.jsonl` stores real filesystem paths, session folders use a slugified format. We built a normalisation map at parse time so both sources merge correctly without double counting.

---

## Challenges we ran into

The data was messier than expected. Path normalisation, double counting across sources, TypeScript version conflicts breaking Vercel builds, and merge conflicts across three contributors all shipping in parallel. None were blockers but each needed proper diagnosis rather than a workaround.

---

## Accomplishments that we're proud of

- **Live in production** with a real domain
- **UX that feels designed** - the D3 visualisations, slot machine token reveal, sniper shot scatter animation - none were the easy choice but they make the product feel polished
- **End to end pipeline** from raw local files to a shareable character card
- **Taking judge feedback mid-hackathon** and pivoting without losing momentum

---

## What we learned

- Shipping fast under pressure forces good decisions. No time to over-engineer means you find the simplest thing that works.
- Got genuinely deep into D3, the Canvas API, and complex CSS animations
- How to coordinate three contributors in one codebase without stepping on each other
- Taking feedback in real time and acting on it without losing focus

---

## What's next for Claude Code Rewind

The current product is a proof of concept. Fun, story-driven, built on data nobody has surfaced before. The next step is elevating it to something enterprise grade.

**Immediate roadmap - cost visibility:**

Every session file has the model name and exact token counts. Anthropic publishes per-model pricing. What we want to build:

| Feature | What it enables |
|---------|-----------------|
| Cost per project | See which repos burn the most budget |
| Cost per model | Opus vs Sonnet in real spend |
| Weekly/monthly trends | Identify expensive sessions |
| Cost efficiency score | Value per token |

**Bigger picture - AI adoption analytics:**

Aggregate across teams, track usage patterns, identify which workflows get the most AI leverage, and help organisations understand how to train engineers to use AI more efficiently. The data infrastructure already exists in these local files. We just need the enterprise pipeline on top.
