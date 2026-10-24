import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function file(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('Netlify routes point to the CRM functions', async () => {
  const config = await file('netlify.toml');
  assert.match(config, /from = "\/api\/callback"[\s\S]*to = "\/.netlify\/functions\/callback"/);
  assert.match(config, /from = "\/api\/admin\/callbacks\/export\.csv"[\s\S]*to = "\/.netlify\/functions\/admin-export-csv"/);
});

test('Neon schema contains the required CRM columns', async () => {
  const migration = await file('migrations/0002_neon_schema.sql');
  for (const column of ['created_at', 'name', 'phone', 'preferred_call_time', 'consent_given', 'consent_version', 'call_date', 'result', 'comment']) {
    assert.match(migration, new RegExp(`\\b${column}\\b`));
  }
});

test('CSV export keeps the required nine-column order', async () => {
  const source = await file('netlify/functions/admin-export-csv.ts');
  const expected = ['ID заявки', 'Дата заявки', 'Имя', 'Телефон', 'Удобное время для звонка', 'Согласие на обработку ПД', 'Дата звонка', 'Результат', 'Комментарий'];
  for (const column of expected) assert.match(source, new RegExp(column));
  assert.match(source, /isAdmin\(event\.headers\.cookie\)/);
});

test('public callback server code requires consent and parameterized SQL', async () => {
  const source = await file('netlify/functions/callback.ts');
  assert.match(source, /payload\.consent !== true/);
  assert.match(source, /ON CONFLICT \(idempotency_key\) DO NOTHING/);
  assert.match(source, /preferred_call_time/);
});
