# Changelog

All notable changes are documented here. Format: [Keep a Changelog](https://keepachangelog.com/), versioning: [SemVer](https://semver.org/).

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
