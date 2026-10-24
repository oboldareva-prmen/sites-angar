/*
# Create Neon PostgreSQL CRM schema

1. Purpose
- Creates the permanent PostgreSQL storage used by Netlify Functions.
- This migration is additive and safe to run on a new Neon database or on a database that already contains these tables.
- It does not drop, rename, or delete any table or column, so existing records are preserved.

2. New tables
- `callback_requests` stores visitor contact details, consent evidence, and administrator CRM fields.
- `admin_rate_limits` stores persistent administrator login attempt counters.
- `callback_rate_limits` stores persistent public-form request counters.

3. Important columns
- `id` is the request UUID.
- `created_at` records when the request was saved.
- `preferred_call_time` stores optional free-form visitor input.
- `consent_given` and `consent_version` preserve the consent decision and text version.
- `call_date`, `result`, and `comment` are administrator-managed CRM fields.
- `idempotency_key` prevents duplicate submissions.

4. Security
- The database is accessed only by server-side Netlify Functions through `DATABASE_URL`.
- No database credentials or direct database access are exposed to browser code.
- Rate-limit rows are kept in PostgreSQL so limits work across function instances.

5. Deployment note
- Apply this SQL in the Neon SQL Editor before publishing the Netlify site.
- If a previous Neon schema already exists, the `IF NOT EXISTS` clauses preserve it.
*/

CREATE TABLE IF NOT EXISTS callback_requests (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT,
  phone TEXT NOT NULL,
  preferred_call_time TEXT,
  consent_given BOOLEAN NOT NULL CHECK (consent_given = true),
  consent_version TEXT NOT NULL,
  call_date DATE,
  result TEXT,
  comment TEXT,
  notification_status TEXT NOT NULL DEFAULT 'not_configured',
  idempotency_key TEXT NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS callback_requests_created_at_idx
  ON callback_requests (created_at DESC);

CREATE TABLE IF NOT EXISTS admin_rate_limits (
  key TEXT PRIMARY KEY,
  window_started_at BIGINT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS callback_rate_limits (
  key TEXT PRIMARY KEY,
  window_started_at BIGINT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0
);
