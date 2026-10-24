import type { Handler } from '@netlify/functions';
import { csvRow, database, isAdmin, methodNotAllowed, noStoreHeaders } from './_shared';

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
  if (event.httpMethod !== 'GET') return methodNotAllowed('GET');
  if (!(await isAdmin(event.headers.cookie))) return { statusCode: 403, headers: noStoreHeaders(), body: 'Доступ запрещён.' };

  try {
    const rows = await database()`
      SELECT id, created_at, name, phone, preferred_call_time, consent_given, call_date, result, comment
      FROM callback_requests
      ORDER BY created_at ASC
    ` as CallbackRow[];
    const columns = ['ID заявки', 'Дата заявки', 'Имя', 'Телефон', 'Удобное время для звонка', 'Согласие на обработку ПД', 'Дата звонка', 'Результат', 'Комментарий'];
    const dataRows = rows.map((row) => csvRow([
      row.id,
      row.created_at,
      row.name,
      row.phone,
      row.preferred_call_time,
      row.consent_given ? 'Да' : 'Нет',
      row.call_date,
      row.result,
      row.comment,
    ]));
    const csv = `\uFEFF${csvRow(columns)}\r\n${dataRows.join('\r\n')}`;
    const filename = `callback_requests_${new Date().toISOString().slice(0, 10)}.csv`;
    return {
      statusCode: 200,
      headers: { ...noStoreHeaders(), 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` },
      body: csv,
    };
  } catch {
    return { statusCode: 500, headers: noStoreHeaders(), body: 'Не удалось подготовить выгрузку.' };
  }
};
