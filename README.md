# CC Rewind

Spotify Wrapped, but for your Claude Code usage. Upload your `~/.claude` folder, get a personalised story of how you use Claude — ending with your archetype and a Claude Power Score.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and select your `~/.claude` folder.

## Finding Your .claude Folder

The `.claude` folder is hidden by default. You need to enable hidden file visibility in your OS **before** selecting it in the browser file picker.

### macOS
Press **Cmd + Shift + .** in the Finder file dialog to toggle hidden files.

Your folder is at: `~/.claude` (e.g. `/Users/yourname/.claude`)

### Windows
1. Open File Explorer
2. Click **View** in the toolbar
3. Check **Hidden items** (or go to View → Show → Hidden items)

Your folder is at: `C:\Users\yourname\.claude`

### Linux
Press **Ctrl + H** in your file manager to show hidden files.

Your folder is at: `~/.claude` (e.g. `/home/yourname/.claude`)

> **Note:** Browsers cannot auto-open a specific folder path for security reasons. You'll need to navigate to `~/.claude` manually in the file picker after enabling hidden files.

## Privacy

All data processing happens 100% client-side in your browser. Zero data leaves the page.

## Tech Stack

Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion + D3
