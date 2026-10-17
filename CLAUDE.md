# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a static personal portfolio/homepage site for Kieran Fraser, deployed via GitHub Pages (custom domain `kieranfraser.ie` set via `CNAME`). Every page is a plain, hand-written `.html` file that references shared CSS/JS in `assets/`. `.nojekyll` disables Jekyll processing, so files are served exactly as committed — there is no server-side rendering, bundler, or build step in the deploy path. A local `package.json` exists purely for developer tooling (Sass compilation, a local static server); it has no effect on what GitHub Pages serves.

Base template: [Strata by HTML5 UP](https://html5up.net) (see `README.txt` for the original template credits/license).

## Working with this repo

- `npm install` — installs local dev tooling (`sass`, `http-server`); nothing else in the repo depends on Node.
- `npm run dev` — serves the repo root at `http://localhost:8080` with caching disabled, so pages/assets can be previewed as GitHub Pages would serve them.
- `npm run build:css` — compiles `assets/sass/main.scss` → `assets/css/main.css` (expanded output).
- `npm run watch:css` — same as above, recompiling on save while editing Sass.
- `npm run build:html` — regenerates `redesign/*.html` from `src/pages/` + `src/partials/layout.html` (see "Redesign in progress" below). Run this after any change under `src/`.
- There is no lint/test command and no CI — deployment is automatic: pushing to `master` publishes via GitHub Pages, so what's committed is exactly what's served.

### CSS build caveat

`assets/css/main.css` was originally compiled with an older Sass toolchain (and had a few rules hand-edited directly into the compiled output over the years). As of this tooling setup, `assets/sass/main.scss` has been reconciled so it is a complete, lossless source for the committed CSS — the only remaining diff between `npm run build:css` output and the committed file is cosmetic (Dart Sass drops quotes in attribute selectors and normalizes spacing like `2n + 1` → `2n+1`). Because of that reordering/reformatting, running `build:css` will still produce a large-looking diff the first time; that's expected — review it rather than assuming something broke. Going forward, add new styles to `main.scss` (not the compiled CSS) and rebuild, so it stays the source of truth.

## Site structure

Each top-level page is self-contained and pulls shared styling/scripts from `assets/`:

- `index.html` — homepage/landing page, links out to the other top-level pages (Photography, Videography, Virtual Spaces, 3D Artwork).
- `photography.html`, `videography.html`, `3dartwork.html`, `myspaces.html` — portfolio sections, generally structured as a Poptrox-powered lightbox gallery over images in `images/` (see `images/thumbs`, `images/fulls`, `images/multiverse-thumbs`, `images/multiverse-fulls`, `images/parallel-thumbs`).
- `empushy.html` / `empushy-sw.js` — standalone sub-project page with its own service worker.
- `ar-test.html` — standalone AR.js/A-Frame location-based AR demo (loads AR.js/A-Frame from CDN, not part of the shared template).
- `emulator.html`, `index_original.html` — legacy/alternate pages kept for reference.
- `workings/` — untracked scratch area (Jupyter notebooks, working files); ignored via `.gitignore`.

## Assets layout (`assets/`)

- `css/` — compiled stylesheets (`main.css`, plus per-page stylesheets like `multiverse.css`, `parallelism.css`, `pushd.css`, `noscript.css`). `main.css` is compiled from `sass/main.scss` (imports `sass/libs/_vars.scss`, `_mixins.scss`, `_breakpoints.scss`, etc.) — edit the `.scss` and recompile rather than hand-editing generated CSS where possible.
- `sass/` — Sass source for `main.css`, following the standard HTML5 UP partial structure (`libs/_vars`, `_functions`, `_mixins`, `_vendor`, `_breakpoints`, `_html-grid`).
- `js/` — jQuery-based interaction scripts. `main.js` drives the base template; `main_parallelism.js`, `multiverse.js`, `multiverse-util.js`, `pushd*.js` are per-page/per-project scripts loaded only where needed.
- `magnemite/` — a glTF 3D scene (`scene.gltf` + `scene.bin` + `textures/`) used by the 3D artwork content.
- `pdf/`, `slides/` — publication PDFs and slide decks linked from portfolio pages.

## Redesign in progress (`redesign/`)

`redesign/` is a staged rebuild of the whole site (new "illustrated editorial magazine" design system in `assets/css/site-v2.css`) that will eventually replace the repo-root pages above. It is **generated output** — do not hand-edit files directly under `redesign/`.

- Source of truth lives in `src/pages/*.html` (one lean file per page) and `src/partials/layout.html` (the single shared header/nav/mobile-menu/footer/script template).
- `npm run build:html` (runs `scripts/build-html.js`) assembles each `src/pages/*.html` into the matching flat, static `redesign/*.html` file. The output has zero client-side includes or server-side processing — it's exactly what GitHub Pages will serve once `redesign/` is promoted to the repo root.
- Each `src/pages/*.html` source is just the page's unique content, wrapped in small HTML-comment blocks the build script parses:
  - `<!--meta\ntitle: ...\ndescription: ...\n-->` (required) — the rest (canonical URL, OG/Twitter tags, Person JSON-LD, active nav link, `og:type`) is derived automatically from the filename by `build-html.js`.
  - `<!--head-extra\n...\n-->` (optional) — raw HTML injected into `<head>` (e.g. a case-study's `--case-accent` style tag, About's inline grid CSS).
  - `<!--body-pre\n...\n-->` (optional) — raw HTML injected into `<body>` before the page shell (currently only `index.html`'s inert SVG filter def).
  - `<main id="main">...</main>` (required) — the page's actual content.
- To change shared chrome (nav links, wordmark, footer, mobile menu, the lens-switcher/menu-toggle script), edit `src/partials/layout.html` once and rerun `npm run build:html` — it regenerates all pages instead of requiring 22 individual edits.
- Asset paths in the layout currently use a hardcoded `../` prefix (`ASSET_BASE` constant at the top of `scripts/build-html.js`), since `redesign/` is nested one level below the assets it references. When `redesign/` is promoted to the repo root, flip that constant to `''` and rerun the build — a one-line change instead of another 22-file edit.

## Notable conventions

- Pages reference each other with relative paths (e.g. `./photography.html`), so keep new pages at the repo root unless updating all inbound links.
- Several `pushd*.html`/service-worker files are explicitly gitignored (see `.gitignore`) — they are part of a separate, non-public sub-project and should not be re-added to version control.
- Large binary assets (images, PDFs, `.gltf`/`.bin`) are committed directly to the repo; there's no LFS setup, so keep new binary assets reasonably sized.
