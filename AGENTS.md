# boxclub

Static landing page for a boxing school. Deployed via GitHub Pages.

## Commands

| Command | Action |
|---|---|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build -> `docs/` |
| `npm run preview` | Preview production build |

No tests, linter, typechecker, or CI config.

## Architecture

Single-page app with Alpine.js 3 for interactivity, Vite 7 for bundling.

```
index.html          — all markup (SPA, all sections in one file)
js/main.js          — Alpine boot + component registration
js/components/      — Alpine data components (header, hero, about, training, gallery, reviews)
js/data/            — static arrays imported by components
js/utils/           — animation helpers
css/main.css        — imports base.css + components.css + sections/*.css
css/sections/       — one CSS file per section
docs/               — build output (git-tracked, deployed by GitHub Pages)
```

## Build quirks

- `vite.config.js` sets `base: '/boxclub/'` so the site lives at `<user>.github.io/boxclub/`
- `build.outDir` is `docs/` (GitHub Pages default for user/org repos)
- The `@` import alias resolves to `js/`
- Alpine components use `init()`/`destroy()` lifecycle hooks; register via `Alpine.data(name, factory)` in `main.js`
- CSS uses BEM naming: `.block__element--modifier`; CSS custom properties in `:root`
- Index HTML includes full Russian SEO metadata, structured data (JSON-LD), Open Graph, and Twitter Card tags

## Content

Edit data in `js/data/` (training plans, gallery items, reviews, achievements). Images live in `images/`.
