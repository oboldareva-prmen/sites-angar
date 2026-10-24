import type { Handler } from '@netlify/functions';
import {
  consentVersion,
  database,
  header,
  hashRateKey,
  json,
  methodNotAllowed,
  newRequestId,
  noStoreHeaders,
  normalizePhone,
  optionalText,
  parseJsonBody,
  requestIp,
} from './_shared';

type CallbackPayload = {
  name?: unknown;
  phone?: unknown;
  preferred_call_time?: unknown;
  consent?: unknown;
};

type StoredCallback = {
  id: string;
  name: string | null;
  phone: string;
  preferred_call_time: string | null;
};

async function notifyTelegram(row: StoredCallback): Promise<'sent' | 'not_configured' | 'failed'> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return 'not_configured';

  const message = [
    'Новая заявка на обратный звонок',
    `ID: ${row.id}`,
    `Имя: ${row.name ?? 'не указано'}`,
    `Телефон: ${row.phone}`,
    `Удобное время: ${row.preferred_call_time ?? 'не указано'}`,
  ].join('\n');

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });
    return response.ok ? 'sent' : 'failed';
  } catch {
    return 'failed';
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed('POST');

  try {
    const idempotencyKey = header(event.headers, 'Idempotency-Key');
    if (!idempotencyKey || idempotencyKey.length < 16 || idempotencyKey.length > 128) {
      return json({ error: 'Не удалось проверить повторную отправку.' }, 400, noStoreHeaders());
    }

    const payload = parseJsonBody(event.body, 20_000) as CallbackPayload | null;
    if (!payload) return json({ error: 'Проверьте данные формы.' }, 400, noStoreHeaders());

    const phone = normalizePhone(payload.phone);
    if (!phone) return json({ error: 'Укажите корректный номер телефона.' }, 400, noStoreHeaders());
    if (payload.consent !== true) return json({ error: 'Необходимо подтвердить согласие на обработку персональных данных.' }, 400, noStoreHeaders());

    const name = optionalText(payload.name, 120);
    const preferredCallTime = optionalText(payload.preferred_call_time, 120);
    if (payload.name !== undefined && payload.name !== null && payload.name !== '' && name === null) return json({ error: 'Проверьте поле имени.' }, 400, noStoreHeaders());
    if (payload.preferred_call_time !== undefined && payload.preferred_call_time !== null && payload.preferred_call_time !== '' && preferredCallTime === null) return json({ error: 'Проверьте удобное время для звонка.' }, 400, noStoreHeaders());

    const sql = database();
    const rateKey = hashRateKey(`${requestIp(event.headers)}:${process.env.SESSION_SECRET ?? 'callback'}`);
    const windowStartedAt = Math.floor(Date.now() / 900000) * 900000;
    const [rateLimit] = await sql`
      INSERT INTO callback_rate_limits (key, window_started_at, attempts)
      VALUES (${rateKey}, ${windowStartedAt}, 1)
      ON CONFLICT (key) DO UPDATE SET
        attempts = CASE WHEN callback_rate_limits.window_started_at = EXCLUDED.window_started_at THEN callback_rate_limits.attempts + 1 ELSE 1 END,
        window_started_at = EXCLUDED.window_started_at
      RETURNING attempts
    ` as Array<{ attempts: number }>;
    if ((rateLimit?.attempts ?? 0) > 10) return json({ error: 'Слишком много заявок. Попробуйте позже.' }, 429, noStoreHeaders());

    const id = newRequestId();
    const [inserted] = await sql`
      INSERT INTO callback_requests
        (id, created_at, name, phone, preferred_call_time, consent_given, consent_version, idempotency_key)
      VALUES
        (${id}, now(), ${name}, ${phone}, ${preferredCallTime}, true, ${consentVersion}, ${idempotencyKey})
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING id
    ` as Array<{ id: string }>;

    if (!inserted) {
      const [existing] = await sql`SELECT id FROM callback_requests WHERE idempotency_key = ${idempotencyKey}` as Array<{ id: string }>;
      if (!existing) return json({ error: 'Не удалось проверить сохранённую заявку.' }, 500, noStoreHeaders());
      return json({ accepted: true, duplicate: true, id: existing.id }, 200, noStoreHeaders());
    }

    const row: StoredCallback = { id, name, phone, preferred_call_time: preferredCallTime };
    const notificationStatus = await notifyTelegram(row);
    await sql`UPDATE callback_requests SET notification_status = ${notificationStatus} WHERE id = ${id}`;

    return json({ accepted: true, id, notification: notificationStatus }, notificationStatus === 'failed' ? 202 : 201, noStoreHeaders());
  } catch {
    return json({ error: 'Не удалось сохранить заявку. Попробуйте ещё раз.' }, 500, noStoreHeaders());
  }
};
