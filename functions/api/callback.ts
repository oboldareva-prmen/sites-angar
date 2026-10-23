import { consentVersion, json, normalizePhone, noStoreHeaders, optionalText, type PagesContext } from '../types';

type CallbackPayload = {
  name?: unknown;
  phone?: unknown;
  callbackTime?: unknown;
  consent?: unknown;
};

type StoredCallback = {
  id: string;
  name: string | null;
  phone: string;
  callback_time: string | null;
};

async function notifyTelegram(env: PagesContext['env'], row: StoredCallback): Promise<'sent' | 'not_configured' | 'failed'> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return 'not_configured';
  const message = [
    'Новая заявка на обратный звонок',
    `ID: ${row.id}`,
    `Имя: ${row.name ?? 'не указано'}`,
    `Телефон: ${row.phone}`,
    `Удобное время: ${row.callback_time ?? 'не указано'}`,
  ].join('\n');

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: message }),
    });
    return telegramResponse.ok ? 'sent' : 'failed';
  } catch {
    return 'failed';
  }
}

export const onRequestPost: PagesFunction<PagesContext['env']> = async (context) => {
  const idempotencyKey = context.request.headers.get('Idempotency-Key')?.trim();
  if (!idempotencyKey || idempotencyKey.length < 16 || idempotencyKey.length > 128) {
    return json({ error: 'Не удалось проверить повторную отправку.' }, 400, noStoreHeaders());
  }

  try {
    const payload = await context.request.json() as CallbackPayload;
    const phone = normalizePhone(payload.phone);
    if (!phone) return json({ error: 'Укажите корректный номер телефона.' }, 400, noStoreHeaders());
    if (payload.consent !== true) return json({ error: 'Необходимо подтвердить согласие на обработку персональных данных.' }, 400, noStoreHeaders());

    const name = optionalText(payload.name, 120);
    const callbackTime = optionalText(payload.callbackTime, 120);
    if (payload.name !== undefined && payload.name !== null && payload.name !== '' && name === null) return json({ error: 'Проверьте поле имени.' }, 400, noStoreHeaders());
    if (payload.callbackTime !== undefined && payload.callbackTime !== null && payload.callbackTime !== '' && callbackTime === null) return json({ error: 'Проверьте удобное время для звонка.' }, 400, noStoreHeaders());

    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const insert = await context.env.DB.prepare(`
      INSERT OR IGNORE INTO callback_requests
        (id, submitted_at, name, phone, consent_given, consent_version, consent_at, callback_time, created_at, updated_at, idempotency_key)
      VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)
    `).bind(id, now, name, phone, consentVersion, now, callbackTime, now, now, idempotencyKey).run();

    if (!insert.success) return json({ error: 'Не удалось сохранить заявку. Попробуйте ещё раз.' }, 500, noStoreHeaders());

    const stored = await context.env.DB.prepare('SELECT id FROM callback_requests WHERE idempotency_key = ?').bind(idempotencyKey).first<{ id: string }>();
    if (!stored) return json({ error: 'Не удалось проверить сохранённую заявку.' }, 500, noStoreHeaders());
    if (stored.id !== id) return json({ accepted: true, duplicate: true, id: stored.id }, 200, noStoreHeaders());

    const row: StoredCallback = { id, name, phone, callback_time: callbackTime };
    const notificationStatus = await notifyTelegram(context.env, row);
    await context.env.DB.prepare('UPDATE callback_requests SET notification_status = ?, updated_at = ? WHERE id = ?').bind(notificationStatus, new Date().toISOString(), id).run();

    return json({ accepted: true, id, notification: notificationStatus }, notificationStatus === 'failed' ? 202 : 201, noStoreHeaders());
  } catch {
    return json({ error: 'Не удалось обработать заявку. Попробуйте ещё раз.' }, 400, noStoreHeaders());
  }
};
