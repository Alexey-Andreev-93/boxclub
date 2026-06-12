# Roadmap — интернет-магазин для школы бокса

## 1. Архитектура

```
boxclub.ru
├── /                     ← статика (текущий Alpine.js сайт) — Object Storage
├── /shop/*               ← магазин — Next.js (SSR/ISR) в Serverless Containers или VM
├── /admin/               ← админка (текущая + расширенная) — Object Storage
├── /api/*                ← Next.js API Routes (встроены в магазин)
└── Cloud CDN             ← HTTPS + кеширование
```

## 2. Стек

| Компонент | Технология |
|---|---|
| Магазин (фронт + API) | Next.js (React/TypeScript) |
| Баз данных | YDB Serverless |
| Платежи | YooKassa |
| Хостинг статики | Yandex Object Storage |
| Хостинг магазина | Yandex Serverless Containers или VM |
| Домен + DNS | Cloud DNS |
| HTTPS + CDN | Cloud CDN (Let's Encrypt) |
| Админка | HTML/CSS/JS (расширить текущую) |

## 3. База данных (YDB)

Таблицы:

- **categories** — id, name, slug, sort_order
- **products** — id, category_id, name, description, price, sizes (JSON: S/M/L/XL), image, stock, created_at, updated_at
- **orders** — id, customer_name, phone, address, total, status (new/paid/shipped/completed), payment_id, created_at
- **order_items** — id, order_id, product_id, size, quantity, price

## 4. Фазы реализации

### Фаза A — Данные + Бэкенд (~1 неделя)

| Задача | Описание |
|---|---|
| Создать Next.js проект с TypeScript | `npx create-next-app@latest shop --typescript` |
| Настроить YDB SDK | Подключение, CRUD-утилиты |
| Спроектировать и создать таблицы | 4 таблицы, индексы |
| API: GET /api/products | Список товаров (с фильтром по категории) |
| API: GET /api/categories | Список категорий |
| API: POST /api/order | Создание заказа |
| API: POST /api/payment | Создание платежа через YooKassa |
| API: POST /api/payment/webhook | Приём уведомлений от YooKassa |

### Фаза B — Витрина магазина (~1 неделя)

| Задача | Описание |
|---|---|
| Страница /shop | Каталог товаров (сетка, карточки) |
| Страница /shop/[slug] | Детальная: фото, описание, размеры, цена, кнопка «В корзину» |
| Фильтр по категориям | Табы или выпадающий список |
| Корзина | localStorage, попап с товарами, сумма |
| Страница /shop/cart | Оформление: форма (имя, телефон, адрес), кнопка «Оплатить» |
| YooKassa redirect | После оплаты — страница успеха /shop/success |
| Страница /shop/success | Спасибо за заказ |
| Dockerfile | Для деплоя Next.js в контейнер |

### Фаза C — Админка магазина (~1 неделя)

| Задача | Описание |
|---|---|
| Вкладка «Товары» в админке | CRUD: название, описание, цена, категория, размеры, фото |
| Вкладка «Заказы» в админке | Список заказов, статусы (сменить статус), детали |
| Загрузка фото товаров | `/admin/upload` → папка `images/products/` |
| Cloud Function: CRUD для товаров | POST/GET/PUT/DELETE /api/admin/products |
| Cloud Function: заказы | GET /api/admin/orders, PUT /api/admin/orders/:id/status |

### Фаза D — Инфраструктура (~2 дня)

| Задача | Описание |
|---|---|
| Купить домен boxclub.ru | Cloud DNS → Мои домены |
| Создать Cloud CDN | Источник: Object Storage, Let's Encrypt |
| Serverless Containers | Поднять Next.js, пробросить порт 3000 |
| API Gateway | Маршруты /api/* → Cloud Functions |
| GitHub Actions | Авто-деплой магазина из репы |
| CNAME | boxclub.ru → edgecdn адрес |

## 5. Где запускать магазин (выбор)

| Вариант | Стоимость | Сложность | Деплой |
|---|---|---|---|
| **Serverless Containers** | ~1000–1500₽/мес | Низкая | docker push → авто-кеш |
| **VM (Compute Cloud)** | ~800–1200₽/мес | Средняя | SSH + systemd + Nginx |

Решение: **Serverless Containers** (проще поддерживать, не надо чинить VM).

## 6. Дополнительно уточнить перед стартом

- Доставка: только самовывоз или отправка по РФ (СДЭК/Почта)?
- Категории товаров: экипировка (перчатки, шлемы, бинты, капы), мерч (футболки, кепки, худи)?
- Размеры: для одежды S/M/L/XL, для экипировки — без размеров?
- Фото товаров: готовые снимки от поставщиков или съёмка + загрузка через админку?
- Бюджет: кто оплачивает инфраструктуру (1000–2000₽/мес)?

## 7. Примерный бюджет в месяц

| Статья | Стоимость |
|---|---|
| Serverless Containers | ~1000–1500 ₽ |
| YDB Serverless | ~0–500 ₽ (бесплатно до 5 ГБ) |
| Cloud CDN | ~0–300 ₽ |
| YooKassa | 2.5–3.5% с платежа |
| **Итого** | **~1000–2300 ₽/мес** |
