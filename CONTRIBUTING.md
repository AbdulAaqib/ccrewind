# Contributing to Claude Code Rewind

## Local setup

```bash
git clone https://github.com/Junaid2005/ccrewind.git
cd ccrewind
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Your `~/.claude` folder is auto-detected — click **Use your local data** to skip the upload step.

## Code quality

All checks run in CI on every push and PR. Run them locally before pushing:

```bash
npm run format        # Prettier auto-fix
npm run format:check  # Prettier check (CI mode)
npm run lint          # ESLint
npm test              # Jest (49 tests)
npm run build         # TypeScript + Next.js production build
npm run build:tui     # esbuild TUI bundle → dist/ccrewind-tui.mjs
```

Any failure blocks merge.

## Submitting a PR

1. Fork the repo and create a branch from `main`.
2. Make your changes. Keep PRs focused — one thing per PR.
3. Run the full check suite locally (`format:check`, `lint`, `test`, `build`).
4. Open a PR against `main`. CI runs automatically.

## Release & versioning

We use semver. The release flow is:

1. **Bump** `package.json` → `"version": "X.Y.Z"` manually.
2. **Commit**: `chore: bump version to X.Y.Z`
3. **Tag and push**:
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```
4. CI runs the full check suite, creates a GitHub Release with auto-generated changelog, builds the TUI bundle, and **publishes to npm automatically**.

The npm package is `ccrewind`. Users run it via `npx ccrewind`.

## Setting up NPM_TOKEN (for forks)

If you fork this repo and want auto-publish to work on your fork:

1. Generate a token at [npmjs.com](https://www.npmjs.com) → Access Tokens → Granular Access Token (or Classic Automation token).
2. Add it to your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**.
3. Name: `NPM_TOKEN`, Value: your token.

The release workflow reads `${{ secrets.NPM_TOKEN }}` automatically.
