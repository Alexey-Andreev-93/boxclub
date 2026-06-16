# TODO — план исправлений

## Выполнено
- Безопасность: токен вместо пароля, `hmac.compare_digest`, rate limiting, CORS, path traversal
- Утечки памяти: `destroy()` во всех Alpine-компонентах, `requestAnimationFrame` вместо `setInterval`
- `Promise.all` → fallback с таймаутом
- Валидация данных перед save в админке
- API URL вынесен в конфиг (не хардкод)
- Прогресс-бар загрузки (был — откатили)
- Мобильное меню админки: две строки + save-bar виден
- SEO: prerender / SSG (инжекция `__INITIAL_STATE__`)
- `robots.txt` + `sitemap.xml` (закрыта админка от индексации)

## 🚨 Критические

- [ ] **Rate limiting через in-memory словарь не работает в serverless**
      `oauth-proxy/main.py:25` — при холодном старте функции лимит сбрасывается.
      Надо: Redis, Yandex Lockbox или отказаться от IP-лимита в пользу HMAC-запроса.

- [ ] **Нет валидации `path` в `/admin/save`**
      `oauth-proxy/main.py:154` — путь из тела запроса не проверяется.
      Надо: белый список разрешённых путей (как сделано для upload).

- [ ] **Нет Content Security Policy (CSP)**
      `index.html` — нет защиты от XSS.

## ⚠️ Средние

- [ ] **`.gitignore` отсутствует**
      `__pycache__/`, `node_modules/`, `.env` не игнорируются.
      Уже есть untracked: `.github/scripts/__pycache__/`, `oauth-proxy/__pycache__/`.

- [ ] **`.github/workflows/` нет в репозитории**
      CI/CD описан в AGENTS.md, но файлов нет. При свежем клоне деплой не настроить.

- [ ] **Компоненты-заглушки (`reviews.js`, `contact.js`)**
      Секции на странице есть, логики нет. Контент не отображается.

- [ ] **Нет проверки Content-Type при загрузке файлов**
      `/admin/upload` — можно загрузить любой файл (не только изображения).

- [ ] **Самописный JWT с хрупким base64 padding**
      `oauth-proxy/main.py:103-105` — расчёт padding может упасть на edge-кейсах.

- [ ] **`x-html` в Alpine.js**
      `index.html:155` — рендерит HTML напрямую. При компрометации JSON — XSS.

## 🔧 Мелкие

- [ ] **`__pycache__` висят в untracked** — добавить в `.gitignore`
- [ ] **Font Awesome целиком (~150KB)** — реально ~20 иконок, нужен subset
- [ ] **`.nojekyll`** — мусор от Netlify, не нужен для Yandex Cloud
- [ ] **CSS `@import`** — заменить на PostCSS или ESM
- [ ] **`prefers-reduced-motion`** — уважать системные настройки анимации
- [ ] **Унифицировать лайтбоксы** — hero + gallery
- [ ] **Добавить линтер в CI**
