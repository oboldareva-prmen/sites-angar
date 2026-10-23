CREATE TABLE IF NOT EXISTS callback_requests (
  id TEXT PRIMARY KEY NOT NULL,
  submitted_at TEXT NOT NULL,
  name TEXT,
  phone TEXT NOT NULL,
  callback_time TEXT,
  consent_given INTEGER NOT NULL CHECK (consent_given = 1),
  consent_version TEXT NOT NULL,
  consent_at TEXT NOT NULL,
  call_date TEXT,
  result TEXT,
  comment TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  notification_status TEXT NOT NULL DEFAULT 'not_configured',
  idempotency_key TEXT NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS callback_requests_submitted_at_idx
  ON callback_requests (submitted_at DESC);

CREATE TABLE IF NOT EXISTS admin_rate_limits (
  key TEXT PRIMARY KEY NOT NULL,
  window_started_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0
);
