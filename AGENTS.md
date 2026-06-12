# boxclub

Landing page for a boxing school. Deployed on Yandex Cloud.

## Commands

| Command | Action |
|---|---|
| `npm run dev` | Dev server on port 3000 (Vite) |
| `npm run build` | Production build -> `docs/` |
| `npm run preview` | Preview production build |

No tests, linter, typechecker, or CI config.

## Architecture

Single-page app with Alpine.js 3 for interactivity, Vite 7 for bundling, custom admin panel for content management.

```
index.html              — all markup (SPA, all sections in one file)
js/main.js              — Alpine boot + component registration
js/components/          — Alpine data components (header, hero, about, training, gallery, reviews)
css/main.css            — imports base.css + components.css + sections/*.css
css/sections/           — one CSS file per section
public/admin/           — custom admin panel (index.html with embedded CSS/JS)
public/content/         — JSON files edited via admin (training, gallery, reviews, achievements)
public/images/          — images
docs/                   — build output
.github/workflows/      — GitHub Actions CI/CD
oauth-proxy/            — Yandex Cloud Function for admin API
```

## Admin panel (production)

URL: `https://boxclub.website.yandexcloud.net/admin/`
Password: set via `ADMIN_PASS_HASH` env var on the Yandex Cloud Function

The admin panel:
1. Shows password form
2. On correct password, loads content from `public/content/*.json`
3. Provides forms to edit training prices, gallery, reviews, and achievements
4. "Сохранить всё" button → POSTs to the function → function commits to GitHub via PAT
5. GitHub Actions auto-deploys

## Admin API (Yandex Cloud Function)

| Endpoint | Method | Description |
|---|---|---|
| `/admin/login` | POST | Verify password, `{password: "..."}` |
| `/admin/save` | POST | Commit content to GitHub, `{password: "...", files: [{path, content}]}` |

### Function env vars

| Variable | Description |
|---|---|
| `GH_PAT` | GitHub Personal Access Token (repo scope) |
| `BASE_URL` | API Gateway URL |
| `ADMIN_PASS_HASH` | SHA256 of admin password |

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

### Update function

Edit `oauth-proxy/main.py`, then:
```bash
yc serverless function version create \
  --function-name boxclub-oauth \
  --runtime python312 \
  --entrypoint main.handler \
  --memory 128m --execution-timeout 30s \
  --source-path oauth-proxy/main.py \
  --environment GH_PAT=xxx,BASE_URL=https://...,ADMIN_PASS_HASH=...
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
| Function | `boxclub-oauth` |
| API Gateway | `https://d5dno7rs14sms0o16i5m.nkhmighe.apigw.yandexcloud.net` |
| Service account | `boxclub-deploy` (storage.admin on default folder) |

## Build quirks

- `vite.config.js` sets `base: '/'`
- `build.outDir` is `docs/`
- `@` import alias resolves to `js/`
- Alpine components use `init()`/`destroy()` lifecycle hooks; register via `Alpine.data(name, factory)` in `main.js`
- CSS uses BEM naming: `.block__element--modifier`; CSS custom properties in `:root`
- Components fetch data from `public/content/*.json` at runtime via `import.meta.env.BASE_URL`

## Content

Edit content via admin panel at `/admin/` or directly in `public/content/*.json`. In production, save from admin commits to GitHub and GitHub Actions auto-deploys.
