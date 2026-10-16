# Changelog

All notable changes are documented here. Format: [Keep a Changelog](https://keepachangelog.com/), versioning: [SemVer](https://semver.org/).

## [v0.3.0] - 2026-10-16
### Changed
- The saved PNG is named after the UI language (`coloring-….png` in English, `색칠놀이-….png` in Korean) instead of always using the Korean name.
- Build toolchain upgraded: Vite 5.4.21 → 8.3.4, TypeScript 5.9.3 → 7.0.2, vite-plugin-pwa 1.3.0 → 2.0.0. The generated web app manifest and service-worker precache list are unchanged.
- CI now builds and tests on Node 20, 22 and 24. Dependabot opens weekly dependency updates and auto-merges patch/minor ones once CI passes.
- README: Korean summary at the top, standardized header badges and License section.

### Added
- Unit tests for the canvas core and pure logic (5 → 47 tests): undo history (LIFO, `HISTORY_CAP` eviction, stale-after-resize guard), brush interpolation and per-pen stamping, pointer → painter wiring incl. mirror mode, mirror math, PNG export (flatten, outline contain, timestamped filename), layer resize/DPR cap, i18n detection/persistence/fallbacks and full template translation coverage, color/config/state helpers.
- Zero-dependency TypeScript test loader (`test/support/`): tests import `src/*.ts` directly via a Node module hook using Vite's bundled Oxc transformer. Works on the CI Node 20/22/24 matrix without source changes.

### Security
- Build-time dependency advisories resolved (none of these packages ship in the built app): esbuild (GHSA-67mh-4wv8-2f99) and the Vite dev-server `server.fs.deny` bypass via the Vite 8 upgrade; lockfile updates for `postcss` 8.5.29, `fast-uri` 3.1.8 (GHSA-qw65-cvwx-89v3, GHSA-58mr-gqgx-xq4g), `brace-expansion` 2.1.7 / 5.0.12 (GHSA-q2hr-2g5m-vwhr) and `source-map-js` 1.2.2 (GHSA-68fv-2mgg-jv7q).

## [v0.2.1] - 2026-06-30
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
