import { createSession, json, noStoreHeaders, sessionCookie, type PagesContext } from '../../types';

async function sameSecret(left: string, right: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  const size = Math.max(leftBytes.length, rightBytes.length);
  let difference = leftBytes.length ^ rightBytes.length;
  for (let index = 0; index < size; index += 1) difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  return difference === 0;
}

async function hashRateKey(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export const onRequestPost: PagesFunction<PagesContext['env']> = async (context) => {
  try {
    const windowStartedAt = Math.floor(Date.now() / 900000) * 900000;
    const address = context.request.headers.get('CF-Connecting-IP') ?? 'unknown';
    const key = await hashRateKey(`${address}:${context.env.SESSION_SECRET}`);
    await context.env.DB.prepare(`
      INSERT INTO admin_rate_limits (key, window_started_at, attempts)
      VALUES (?, ?, 1)
      ON CONFLICT(key) DO UPDATE SET
        attempts = CASE WHEN window_started_at = excluded.window_started_at THEN attempts + 1 ELSE 1 END,
        window_started_at = excluded.window_started_at
    `).bind(key, windowStartedAt).run();

    const limit = await context.env.DB.prepare('SELECT attempts FROM admin_rate_limits WHERE key = ?').bind(key).first<{ attempts: number }>();
    if ((limit?.attempts ?? 0) > 5) return json({ error: 'Слишком много попыток. Попробуйте позже.' }, 429, noStoreHeaders());

    const payload = await context.request.json() as { password?: unknown };
    if (typeof payload.password !== 'string' || payload.password.length > 256 || !context.env.ADMIN_PASSWORD || !(await sameSecret(payload.password, context.env.ADMIN_PASSWORD))) {
      return json({ error: 'Неверные данные для входа.' }, 401, noStoreHeaders());
    }

    const token = await createSession(context.env.SESSION_SECRET);
    return json({ authenticated: true }, 200, { ...noStoreHeaders(), 'Set-Cookie': sessionCookie(token) });
  } catch {
    return json({ error: 'Не удалось выполнить вход.' }, 400, noStoreHeaders());
  }
};
