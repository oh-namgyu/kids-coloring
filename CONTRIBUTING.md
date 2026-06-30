# Contributing to Kids Coloring 🎨

Thanks for your interest! This is a small, dependency-light static PWA. Contributions that keep it simple, fast, and child-friendly are very welcome.

## Development setup

```bash
npm install
npm run dev        # vite dev server
npm run build      # tsc --noEmit && vite build
npm test           # node --test
```

CI runs `npm ci && npm run build && npm test` on Node 20 and 22.

## Guidelines

- Keep it **static and backend-free** — no accounts, no network calls; the app must keep working fully offline.
- Templates are **inline SVG in code** (no image assets). To add one, append an entry to a category in [`src/templates.ts`](src/templates.ts) (see "Adding templates" in the README).
- Keep touch targets large and the UI icon-first — the audience is children aged ~3–6.
- The in-app UI is **bilingual (English / Korean)**, centralized in [`src/i18n.ts`](src/i18n.ts). Adding a new language is a welcome contribution — add a locale to `MESSAGES` plus the `CAT_EN`/`TPL_EN`-style name maps.
- Describe what changed and how you tested it. A screenshot/GIF helps for visual changes.

## Reporting issues

Open a GitHub issue with steps to reproduce, the device/browser, and a screenshot if it's a visual bug.
