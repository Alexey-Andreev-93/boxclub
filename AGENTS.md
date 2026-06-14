# boxclub — Школа бокса

Landing page for a boxing school. Deployed on Yandex Cloud.

## Stack

- **Frontend**: Alpine.js 3 + Vite 7, vanilla CSS (BEM), no frameworks
- **Hosting**: Yandex Object Storage (static website)
- **CMS**: Custom admin panel (vanilla HTML/JS), password auth, commits to GitHub via PAT
- **CD**: GitHub Actions → build → upload to Yandex Object Storage

## Commands

| Command | Action |
|---|---|
| `npm run dev` | Dev server on port 3000 (Vite) |
| `npm run build` | Production build → `docs/` |
| `npm run preview` | Preview production build |

No tests, linter, or typechecker.

## Project history

### 1. Netlify → Yandex Cloud migration
- All 22 images converted to WebP, compressed 4×, lazy loading added
- Yandex Object Storage bucket `boxclub` with static website hosting
- Yandex Cloud Function `boxclub-oauth` (Python 3.12) + API Gateway for routing
- GitHub Actions workflow: push → build → upload to Yandex Object Storage

### 2. Decap CMS → Custom admin panel
- Decap CMS v3 had a `removeChild` bug that broke the login flow
- Tried versions 3.14.0, 3.3.3, direct PAT redirect, auth-callback postMessage — none worked
- Replaced with a custom admin panel at `/admin/`:
  - Password login (SHA256 hash stored in function env)
  - Tabbed forms for Training, Gallery, Reviews, Achievements
  - Save → POST to function → commits JSON to GitHub via PAT → auto-deploy

### 3. Image upload + category management
- Added `/admin/upload` endpoint to the function (accepts base64 image → commits to GitHub)
- Added file input UI to gallery, reviews, achievements sections
- Added "Add/Remove category" buttons for training section
- Cleaned up dead code (Decap leftovers, unused JS modules, stale build artifacts)

## Architecture

```
index.html              — all markup (SPA, all sections in one file)
js/main.js              — Alpine boot + component registration
js/components/          — Alpine data components (header, hero, about, training, gallery, reviews)
css/main.css            — imports base.css + components.css + sections/*.css
css/sections/           — one CSS file per section
public/admin/           — custom admin panel (index.html with embedded CSS/JS)
public/content/         — JSON files edited via admin (training, gallery, reviews, achievements)
public/images/          — images
docs/                   — build output (gitignored)
.github/workflows/      — GitHub Actions CI/CD
oauth-proxy/            — Yandex Cloud Function for admin API
```

## Admin panel (production)

The admin panel:
1. Shows password form
2. On correct password, loads content from `public/content/*.json`
3. Provides forms to edit training prices, gallery, reviews, and achievements
4. File inputs for image upload — sends to `/admin/upload` → commits to GitHub
5. "Save all" button → POSTs to `/admin/save` → function commits all JSON to GitHub via PAT
6. GitHub Actions auto-deploys (~1 min)

## Admin API (Yandex Cloud Function)

| Endpoint | Method | Body | Description |
|---|---|---|---|
| `/admin/login` | POST | `{password}` | Verify password |
| `/admin/save` | POST | `{password, files: [{path, content}]}` | Commit JSON files to GitHub |
| `/admin/upload` | POST | `{password, filename, data (base64), folder}` | Upload image to GitHub |

### Function env vars

| Variable | Value | Description |
|---|---|---|
| `GH_PAT` | `***` | GitHub PAT (repo scope) |
| `BASE_URL` | `https://d5dno7rs14sms0o16i5m.nkhmighe.apigw.yandexcloud.net` | API Gateway URL |
| `ADMIN_PASS_HASH` | `9d440deef7fa9416d405088b8ccdcb58fa5cad60e88ba27d9add0d0b3a4bfed8` | SHA256 of `boxclub2024` |

### Update function

```bash
yc serverless function version create \
  --function-name boxclub-oauth \
  --runtime python312 \
  --entrypoint main.handler \
  --memory 128m --execution-timeout 60s \
  --source-path oauth-proxy/main.py \
  --environment GH_PAT=xxx,BASE_URL=https://...,ADMIN_PASS_HASH=...
```

### Update API Gateway

```bash
yc serverless api-gateway update d5dno7rs14sms0o16i5m --spec /tmp/api-gw-spec.yaml
```

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

## Yandex Cloud resources

| Resource | ID / URL |
|---|---|
| Object Storage bucket | `boxclub` |
| Website URL | `https://boxclub.website.yandexcloud.net/` |
| Function | `boxclub-oauth` (ID: `d4emk3tre1eqj60k5oae`) |
| API Gateway | `d5dno7rs14sms0o16i5m` → `https://d5dno7rs14sms0o16i5m.nkhmighe.apigw.yandexcloud.net` |
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

## Next steps

1. Buy domain `boxclub.ru` via Yandex Cloud (Cloud DNS → My domains)
2. Create Cloud CDN resource with Let's Encrypt certificate
3. Point CNAME `boxclub.ru` → CDN edge domain
