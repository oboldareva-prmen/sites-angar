import type { Handler } from '@netlify/functions';
import { createSession, database, hashRateKey, json, methodNotAllowed, noStoreHeaders, requestIp, sameSecret, sessionCookie } from './_shared';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed('POST');

  try {
    const sql = database();
    const secret = process.env.SESSION_SECRET ?? '';
    const rateKey = hashRateKey(`${requestIp(event.headers)}:${secret}`);
    const windowStartedAt = Math.floor(Date.now() / 900000) * 900000;
    const [limit] = await sql`
      INSERT INTO admin_rate_limits (key, window_started_at, attempts)
      VALUES (${rateKey}, ${windowStartedAt}, 1)
      ON CONFLICT (key) DO UPDATE SET
        attempts = CASE WHEN admin_rate_limits.window_started_at = EXCLUDED.window_started_at THEN admin_rate_limits.attempts + 1 ELSE 1 END,
        window_started_at = EXCLUDED.window_started_at
      RETURNING attempts
    ` as Array<{ attempts: number }>;
    if ((limit?.attempts ?? 0) > 5) return json({ error: 'Слишком много попыток. Попробуйте позже.' }, 429, noStoreHeaders());

    const body = event.body ? JSON.parse(event.body) as { password?: unknown } : null;
    const password = body?.password;
    if (typeof password !== 'string' || password.length > 256 || !secret || !process.env.ADMIN_PASSWORD || !sameSecret(password, process.env.ADMIN_PASSWORD)) {
      return json({ error: 'Неверные данные для входа.' }, 401, noStoreHeaders());
    }

    const token = await createSession(secret);
    return json({ authenticated: true }, 200, { ...noStoreHeaders(), 'Set-Cookie': sessionCookie(token) });
  } catch {
    return json({ error: 'Не удалось выполнить вход.' }, 500, noStoreHeaders());
  }
};
