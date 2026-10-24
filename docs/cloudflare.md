# Cloudflare Pages + D1 setup

## What is implemented

The public form posts to `POST /api/callback`. The Pages Function validates the phone number and consent, creates a UUID, uses server UTC time, and writes to D1. A repeated request with the same `Idempotency-Key` returns the existing ID instead of creating a duplicate.

Admin routes are:

- `POST /api/admin/login` — password login with an HttpOnly, Secure, SameSite=Strict signed cookie;
- `POST /api/admin/logout` — clears the session cookie;
- `GET /api/admin/callbacks/export.csv` — returns all saved rows as UTF-8 BOM CSV.

There is no public admin UI. This keeps the administrative password and the CSV out of browser JavaScript. An administrator can use an HTTP client or a future protected admin page while retaining the session cookie.

## Create the D1 database

1. In Cloudflare Dashboard, open **Workers & Pages → D1 → Create database**.
2. Create a database named `angar-callbacks`.
3. Copy its real database ID into `wrangler.toml` in place of `REPLACE_WITH_CLOUDFLARE_D1_DATABASE_ID`.
4. Apply `migrations/0001_create_callback_requests.sql` to the production database using the Cloudflare D1 migration workflow.
5. For local development, use the same migration with Wrangler's local D1 database.

Do not commit a real database ID if the project policy treats it as sensitive; the binding still must be configured in the Cloudflare project.

## Pages settings

Connect the GitHub repository to Cloudflare Pages with:

- build command: `npm run build`;
- build output directory: `dist`;
- compatibility date from `wrangler.toml`;
- Functions enabled by keeping the `functions/` directory in the repository;
- D1 binding named exactly `DB` pointing to the production database.

The Pages Functions receive the binding through `context.env.DB`.

## Required production secrets

Add these as Cloudflare Pages **Secrets**, not public variables:

- `ADMIN_PASSWORD` — a long unique owner password;
- `SESSION_SECRET` — a long random signing secret, different from the admin password.

Optional Telegram secrets:

- `TELEGRAM_BOT_TOKEN`;
- `TELEGRAM_CHAT_ID`.

If Telegram is not configured, requests are still stored and the success message explains that owner notification is not delivered. The site never puts these values in client code.

For local development, create an untracked `.dev.vars` file with the same names. Never commit it.

## CSV workflow

1. Log in with `POST /api/admin/login` and the `ADMIN_PASSWORD` value.
2. Keep the returned `angar_admin` cookie.
3. Request `GET /api/admin/callbacks/export.csv` with that cookie.
4. Open the downloaded `callback_requests_YYYY-MM-DD.csv` in Excel.

The columns are fixed: ID заявки, Дата заявки, Имя, Телефон, Удобное время для звонка, Согласие на обработку ПД, Дата звонка, Результат, Комментарий.

New rows leave CRM fields empty. Recommended result values are `Новый`, `Дозвонились`, `Не дозвонились`, `Перезвонить`, `Заинтересован`, `Отказ`, and `Клиент привлечён`.

CSV is a one-way export. Edits made in Excel do not return to D1. Keep a protected working copy and merge later exports manually by `ID заявки` so comments are not lost.

## Testing checklist

After deploying, test:

1. Submit with no consent — the browser blocks it and the server rejects a crafted request with `consent: false`.
2. Submit a valid request — confirm the row in D1 and confirm the success response.
3. Repeat the same request with the same `Idempotency-Key` — confirm no second row appears.
4. Test a phone with spaces, quotes, Cyrillic name, and a line break in the optional name.
5. Log in as admin and download CSV; confirm BOM, nine columns, and empty CRM fields.
6. Request export without the session cookie — confirm `403`.
7. Temporarily break Telegram credentials — confirm the D1 row remains and the UI reports the notification issue.

## Owner actions before publication

The owner must create the D1 database, configure its real binding, set the two required secrets, decide the data-retention period, complete and legally review `docs/consent.md` and `docs/privacy.md`, and provide Telegram credentials if notifications are wanted. Automatic backup policy and who may access exported CSV also need to be agreed in Cloudflare.
