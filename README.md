# Kids Coloring 🎨

[![CI](https://github.com/oh-namgyu/kids-coloring/actions/workflows/ci.yml/badge.svg)](https://github.com/oh-namgyu/kids-coloring/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/github/license/oh-namgyu/kids-coloring)](LICENSE)

> 🌐 **[Live demo](https://kids-coloring-demo.vercel.app)** — best on a tablet; installable & works offline.

A touch-based coloring web app for young children (ages ~3–6). Pick an outline, fill it in with playful pens, and save your artwork. No backend, no accounts, works offline — it's a fully static **Progressive Web App**.

> The in-app UI is in **Korean** (the target audience is Korean-speaking children). Internationalization is a welcome contribution.

## ✨ Features

- **84 outline templates** in 6 categories (animals, princess/fairy, dresses, food, plants/nature, shapes/vehicles) — all generated as inline SVG in code, no image assets.
- **3 fun pens**
  - 🖍️ Pastel — soft, gentle strokes
  - ✨ Pearl — color with sparkles
  - 🌈 Rainbow — glossy rainbow ribbon that cycles hue along the stroke, plus sparkles
- **🦋 Decalcomanie** (mirror) — paint one side, the other mirrors it; a faint center guide line shows the axis.
- **Sparkle sound** — synthesized chime via the Web Audio API (no audio files), with a mute toggle.
- **Tools** — 3 brush sizes, eraser, undo, clear, and **save as PNG** (outline + painting flattened).
- **Child-friendly UI** — icon-first, large touch targets, scrolling/zoom blocked while drawing.
- **PWA** — installable to the home screen; once visited online, it works fully **offline**.

## 🚀 Getting started

```bash
npm install
npm run dev      # dev server (http://localhost:5173)
npm run build    # type-check + static build → dist/
npm run preview  # preview the build
```

No runtime dependencies — only HTML5 Canvas, Web Audio, and Pointer Events. Build tooling is Vite + TypeScript, with `vite-plugin-pwa` for the offline service worker.

## ☁️ Deploy

It's a static site — host `dist/` anywhere (Vercel, Netlify, GitHub Pages, any static server). A `vercel.json` is included (framework preset: Vite; `index.html`/`sw.js` are served with revalidation so updates propagate).

## 📱 Install on a tablet / phone (PWA)

Open the deployed site in the browser, then "Add to Home Screen" (on iOS use **Safari**). It launches full-screen and works offline after the first online visit.

## 🗂️ Structure

```
src/
  main.ts            app wiring + input guards + service worker registration
  config.ts          colors / pens / sizes constants
  state.ts           app state
  templates.ts       84 outline templates (SVG), grouped by category
  audio.ts           sparkle sound (Web Audio)
  canvas/            layers, brush (3 pens + eraser), painter, symmetry, outline, history, save
  ui/                palette, toolbar, picker (category-grouped)
```

## ➕ Adding templates

Add an entry to a category in [`src/templates.ts`](src/templates.ts):

```ts
{ id: 'apple', name: '사과', svg: svg('<circle cx="50" cy="56" r="28"/> ...') }
```

The `svg(...)` helper wraps your shapes in a `100×100` viewBox with a bold rounded stroke and no fill (so the interior stays colorable).

## 📄 License

[MIT](LICENSE)
