---
description: Run your CC Rewind stats report inline
---
Run this command and show the output verbatim. Do not add any commentary, analysis, or surrounding text before or after the output:

```bash
node ~/.local/share/ccrewind/ccrewind-tui.mjs
```

If the command fails because the file is not found, tell the user to install it:
```
npx ccrewind --setup
```
