# Changelog

All notable changes are documented here. Format: [Keep a Changelog](https://keepachangelog.com/), versioning: [SemVer](https://semver.org/).

## [Unreleased]
### Added
- Unit tests for the canvas core and pure logic (5 → 46 tests): undo history (LIFO, `HISTORY_CAP` eviction, stale-after-resize guard), brush interpolation and per-pen stamping, pointer → painter wiring incl. mirror mode, mirror math, PNG export (flatten, outline contain, timestamped filename), layer resize/DPR cap, i18n detection/persistence/fallbacks and full template translation coverage, color/config/state helpers.
- Zero-dependency TypeScript test loader (`test/support/`): tests import `src/*.ts` directly via a Node module hook using Vite's bundled Oxc transformer. Works on the CI Node 20/22 matrix without source changes.

 - 2026-06-30
### Fixed
- Guard `localStorage` access (language preference) with try/catch so the app no longer crashes on load — or when toggling language — in private-mode or storage-disabled browsers/webviews. Falls back to in-memory state.

## [v0.2.0] - 2026-06-30
### Added
- **Bilingual UI (English / Korean)** — auto-detected from the browser language (English by default, Korean for Korean browsers), with a one-tap `한`/`EN` toggle. Tool tooltips, pen names, the 6 categories, and all 84 template names are translated; the language choice is remembered (`localStorage`). New `src/i18n.ts` module.

## [v0.1.0] - 2026-06-23
### Added
- Initial public release.
- 84 outline templates across 6 categories (animals, princess/fairy, dresses, food, plants/nature, shapes/vehicles), all generated as inline SVG — no image assets.
- 3 pens: pastel, pearl, and rainbow (hue-cycling ribbon), plus decalcomanie (mirror) mode.
- Sparkle sound synthesized via the Web Audio API, with a mute toggle.
- Tools: 3 brush sizes, eraser, undo, clear, and save-as-PNG (outline + painting flattened).
- Installable, offline-first Progressive Web App (Vite + TypeScript + Canvas).
