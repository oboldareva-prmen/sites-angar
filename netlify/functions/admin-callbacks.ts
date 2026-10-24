import type { Handler } from '@netlify/functions';
import { database, isAdmin, json, methodNotAllowed, noStoreHeaders, optionalText, parseJsonBody } from './_shared';

type CallbackRow = {
  id: string;
  created_at: string;
  name: string | null;
  phone: string;
  preferred_call_time: string | null;
  consent_given: boolean;
  call_date: string | null;
  result: string | null;
  comment: string | null;
};

export const handler: Handler = async (event) => {
  if (!(await isAdmin(event.headers.cookie))) return json({ error: 'Доступ запрещён.' }, 403, noStoreHeaders());
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'PATCH') return methodNotAllowed('GET, PATCH');

  try {
    const sql = database();
    if (event.httpMethod === 'GET') {
      const rows = await sql`
        SELECT id, created_at, name, phone, preferred_call_time, consent_given, call_date, result, comment
        FROM callback_requests
        ORDER BY created_at DESC
      ` as CallbackRow[];
      return json({ requests: rows }, 200, noStoreHeaders());
    }

    const id = event.queryStringParameters?.id;
    const payload = parseJsonBody(event.body, 10_000);
    if (!id || !payload) return json({ error: 'Проверьте данные обновления.' }, 400, noStoreHeaders());

    const callDate = payload.call_date === null || payload.call_date === '' ? null : optionalText(payload.call_date, 10);
    const result = payload.result === null || payload.result === '' ? null : optionalText(payload.result, 120);
    const comment = payload.comment === null || payload.comment === '' ? null : optionalText(payload.comment, 2000);
    if (payload.call_date !== null && payload.call_date !== '' && !callDate) return json({ error: 'Проверьте дату звонка.' }, 400, noStoreHeaders());
    if (payload.result !== null && payload.result !== '' && !result) return json({ error: 'Проверьте результат.' }, 400, noStoreHeaders());
    if (payload.comment !== null && payload.comment !== '' && !comment) return json({ error: 'Проверьте комментарий.' }, 400, noStoreHeaders());
    if (callDate && !/^\d{4}-\d{2}-\d{2}$/.test(callDate)) return json({ error: 'Проверьте дату звонка.' }, 400, noStoreHeaders());

    const updated = await sql`
      UPDATE callback_requests
      SET call_date = ${callDate}, result = ${result}, comment = ${comment}
      WHERE id = ${id}::uuid
      RETURNING id
    ` as Array<{ id: string }>;
    if (!updated[0]) return json({ error: 'Заявка не найдена.' }, 404, noStoreHeaders());
    return json({ updated: true }, 200, noStoreHeaders());
  } catch {
    return json({ error: 'Не удалось обработать запрос.' }, 500, noStoreHeaders());
  }
};
