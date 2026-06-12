# boxclub

Landing page for a boxing school with Decap CMS. Deployed on Yandex Cloud.

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
docs/                   — build output
.github/workflows/      — GitHub Actions CI/CD
```

## CMS (local dev)

```bash
npm run dev            # starts Vite + decap-server
```

CMS at `http://localhost:3000/admin/`. Data loaded from `public/content/*.json`. After editing, refresh the site page.

## CMS (production)

Production CMS at `https://boxclub.website.yandexcloud.net/admin/`. Uses GitHub backend with Yandex Cloud OAuth proxy. Changes are committed to GitHub and auto-deployed to Yandex Object Storage via GitHub Actions.

## Deploy

On push to `main`:
1. GitHub Actions runs `npm run build`
2. Uploads `docs/` to Yandex Object Storage bucket `boxclub`
3. Site live at `https://boxclub.website.yandexcloud.net/`

### Manual deploy

```bash
npm run build
python3 .github/scripts/deploy.py   # requires YC_KEY_ID + YC_SECRET env vars
```

### GitHub Secrets needed

| Secret | Value |
|---|---|
| `YC_KEY_ID` | Static access key ID for Object Storage |
| `YC_SECRET` | Static access key secret |

### Yandex Cloud resources

| Resource | ID / URL |
|---|---|
| Object Storage bucket | `boxclub` |
| Website URL | `https://boxclub.website.yandexcloud.net/` |
| OAuth function | `boxclub-oauth` |
| OAuth API Gateway | `https://d5dno7rs14sms0o16i5m.nkhmighe.apigw.yandexcloud.net` |
| Service account | `boxclub-deploy` (storage.admin on default folder) |

## Build quirks

- `vite.config.js` sets `base: '/'` (site at root)
- `build.outDir` is `docs/`
- The `@` import alias resolves to `js/`
- Alpine components use `init()`/`destroy()` lifecycle hooks; register via `Alpine.data(name, factory)` in `main.js`
- CSS uses BEM naming: `.block__element--modifier`; CSS custom properties in `:root`
- Index HTML includes full Russian SEO metadata, structured data (JSON-LD), Open Graph, and Twitter Card tags
- Components fetch data from `public/content/*.json` at runtime via `import.meta.env.BASE_URL`

## Content

Edit content via Decap CMS at `/admin/` or directly in `public/content/*.json`. Images go in `public/images/`. In production, CMS saves to GitHub and GitHub Actions auto-deploys.
