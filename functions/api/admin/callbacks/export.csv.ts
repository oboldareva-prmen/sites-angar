import { csvRow, isAdmin, noStoreHeaders, type PagesContext } from '../../../types';

type CallbackRow = {
  id: string;
  submitted_at: string;
  name: string | null;
  phone: string;
  consent_given: number;
  call_date: string | null;
  result: string | null;
  comment: string;
};

export const onRequestGet: PagesFunction<PagesContext['env']> = async (context) => {
  if (!(await isAdmin(context.request, context.env.SESSION_SECRET))) {
    return new Response('Доступ запрещён.', { status: 403, headers: noStoreHeaders() });
  }

  try {
    const result = await context.env.DB.prepare(`
      SELECT id, submitted_at, name, phone, consent_given, call_date, result, comment
      FROM callback_requests
      ORDER BY submitted_at ASC
    `).all<CallbackRow>();
    const columns = ['ID заявки', 'Дата заявки', 'Имя', 'Телефон', 'Согласие на обработку ПД', 'Дата звонка', 'Результат', 'Комментарий'];
    const rows = result.results.map((row) => csvRow([
      row.id,
      row.submitted_at,
      row.name,
      row.phone,
      row.consent_given === 1 ? 'Да' : 'Нет',
      row.call_date,
      row.result,
      row.comment,
    ]));
    const csv = `\uFEFF${csvRow(columns)}\r\n${rows.join('\r\n')}`;
    const filename = `callback_requests_${new Date().toISOString().slice(0, 10)}.csv`;
    return new Response(csv, {
      status: 200,
      headers: {
        ...noStoreHeaders(),
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return new Response('Не удалось подготовить выгрузку.', { status: 500, headers: noStoreHeaders() });
  }
};
