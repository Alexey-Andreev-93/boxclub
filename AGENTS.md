# boxclub

Landing page for a boxing school with Decap CMS. Deployed on Netlify.

## Commands

| Command | Action |
|---|---|
| `npm run dev` | Dev server on port 3000 (Vite + decap-server) |
| `npm run build` | Production build -> `docs/` |
| `npm run preview` | Preview production build |

No tests, linter, typechecker, or CI config.

## Architecture

Single-page app with Alpine.js 3 for interactivity, Vite 7 for bundling, Decap CMS for content management.

```
index.html              — all markup (SPA, all sections in one file)
js/main.js              — Alpine boot + component registration
js/components/          — Alpine data components (header, hero, about, training, gallery, reviews)
css/main.css            — imports base.css + components.css + sections/*.css
css/sections/           — one CSS file per section
public/admin/           — Decap CMS (index.html + config.yml)
public/content/         — JSON files edited by CMS (training, gallery, reviews, achievements)
public/images/          — images uploaded via CMS
netlify.toml            — Netlify build config
docs/                   — build output (not tracked, built by Netlify)
```

## CMS (local dev)

```bash
npm run dev            # starts Vite + decap-server
```

CMS at `http://localhost:3000/admin/`. Data loaded from `public/content/*.json`. After editing, refresh the site page.

## CMS (production)

Production CMS at `https://boxclub.netlify.app/admin/`. Uses Netlify Identity + Git Gateway. Changes are committed to GitHub and auto-deployed by Netlify.

## Build quirks

- `vite.config.js` sets `base: '/'` (site at root)
- `build.outDir` is `docs/`; built by Netlify on each push
- The `@` import alias resolves to `js/`
- Alpine components use `init()`/`destroy()` lifecycle hooks; register via `Alpine.data(name, factory)` in `main.js`
- CSS uses BEM naming: `.block__element--modifier`; CSS custom properties in `:root`
- Index HTML includes full Russian SEO metadata, structured data (JSON-LD), Open Graph, and Twitter Card tags
- Components fetch data from `public/content/*.json` at runtime via `import.meta.env.BASE_URL`

## Content

Edit content via Decap CMS at `/admin/` or directly in `public/content/*.json`. Images go in `public/images/`. In production, CMS saves to GitHub and Netlify auto-deploys.
