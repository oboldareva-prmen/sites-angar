import { FormEvent, useEffect, useState } from 'react';
import { LogOut, Download, Save, RefreshCw } from 'lucide-react';

type CallbackRequest = {
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

type RequestDraft = Pick<CallbackRequest, 'call_date' | 'result' | 'comment'>;
type PageStatus = 'loading' | 'ready' | 'login' | 'error';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export function AdminRequestsPage() {
  const [status, setStatus] = useState<PageStatus>('loading');
  const [requests, setRequests] = useState<CallbackRequest[]>([]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, RequestDraft>>({});

  const loadRequests = async () => {
    setStatus('loading');
    setError('');
    try {
      const response = await fetch('/api/admin/callbacks', { cache: 'no-store' });
      if (response.status === 403) {
        setStatus('login');
        return;
      }
      if (!response.ok) throw new Error('load_failed');
      const result = await response.json() as { requests?: CallbackRequest[] };
      if (!Array.isArray(result.requests)) throw new Error('invalid_response');
      setRequests(result.requests);
      setDrafts(Object.fromEntries(result.requests.map((request) => [request.id, {
        call_date: request.call_date,
        result: request.result,
        comment: request.comment,
      }])));
      setStatus('ready');
    } catch {
      setError('Не удалось загрузить заявки. Попробуйте ещё раз.');
      setStatus('error');
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setError(response.status === 429 ? 'Слишком много попыток. Попробуйте позже.' : 'Неверные данные для входа.');
        return;
      }
      setPassword('');
      await loadRequests();
    } catch {
      setError('Не удалось выполнить вход. Попробуйте ещё раз.');
    }
  };

  const updateDraft = (id: string, field: keyof RequestDraft, value: string) => {
    setDrafts((current) => ({ ...current, [id]: { ...current[id], [field]: value || null } }));
  };

  const saveRequest = async (id: string) => {
    setSavingId(id);
    setError('');
    try {
      const response = await fetch(`/api/admin/callbacks?id=${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(drafts[id]),
      });
      if (response.status === 403) {
        setStatus('login');
        return;
      }
      if (!response.ok) throw new Error('save_failed');
      setRequests((current) => current.map((request) => request.id === id ? { ...request, ...drafts[id] } : request));
    } catch {
      setError('Не удалось сохранить изменения. Попробуйте ещё раз.');
    } finally {
      setSavingId(null);
    }
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => undefined);
    setStatus('login');
    setRequests([]);
  };

  if (status === 'login') {
    return (
      <main className="admin-page">
        <section className="admin-panel admin-login-panel" aria-labelledby="admin-login-title">
          <p className="eyebrow">ЗАКРЫТЫЙ ДОСТУП</p>
          <h1 id="admin-login-title">CRM АНГАР</h1>
          <p className="admin-description">Войдите, чтобы просматривать и обрабатывать заявки.</p>
          <form className="admin-login-form" onSubmit={handleLogin}>
            <label>
              Пароль
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
            </label>
            {error && <p className="admin-error" role="alert">{error}</p>}
            <button className="callback-submit" type="submit">ВОЙТИ</button>
          </form>
        </section>
      </main>
    );
  }

  if (status === 'loading') {
    return <main className="admin-page"><p className="admin-state">Загрузка заявок...</p></main>;
  }

  if (status === 'error') {
    return <main className="admin-page"><section className="admin-panel"><p className="admin-error" role="alert">{error}</p><button className="callback-submit" type="button" onClick={() => void loadRequests()}>ПОВТОРИТЬ</button></section></main>;
  }

  return (
    <main className="admin-page">
      <section className="admin-shell" aria-labelledby="admin-title">
        <header className="admin-header">
          <div>
            <p className="eyebrow">ЗАКРЫТЫЙ ДОСТУП</p>
            <h1 id="admin-title">ЗАЯВКИ НА ОБРАТНЫЙ ЗВОНОК</h1>
          </div>
          <div className="admin-actions">
            <a className="admin-action" href="/api/admin/callbacks/export.csv"><Download size={16} /> CSV</a>
            <button className="admin-action" type="button" onClick={() => void loadRequests()}><RefreshCw size={16} /> ОБНОВИТЬ</button>
            <button className="admin-action" type="button" onClick={() => void logout()}><LogOut size={16} /> ВЫЙТИ</button>
          </div>
        </header>
        {error && <p className="admin-error" role="alert">{error}</p>}
        {requests.length === 0 ? (
          <p className="admin-state">Заявок пока нет.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Заявка</th>
                  <th>Контакты</th>
                  <th>Удобное время</th>
                  <th>Статус и обработка</th>
                  <th>Комментарий</th>
                  <th aria-label="Действие" />
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td><strong>{formatDate(request.created_at)}</strong><small>{request.id}</small></td>
                    <td><strong>{request.name || 'Имя не указано'}</strong><a href={`tel:${request.phone}`}>{request.phone}</a></td>
                    <td>{request.preferred_call_time || 'Не указано'}</td>
                    <td>
                      <span className="admin-status">{drafts[request.id]?.result || 'Новая'}</span>
                      <label className="admin-field-label">Дата звонка<input type="date" value={drafts[request.id]?.call_date || ''} onChange={(event) => updateDraft(request.id, 'call_date', event.target.value)} /></label>
                      <label className="admin-field-label">Результат<input type="text" value={drafts[request.id]?.result || ''} onChange={(event) => updateDraft(request.id, 'result', event.target.value)} maxLength={120} /></label>
                    </td>
                    <td><textarea value={drafts[request.id]?.comment || ''} onChange={(event) => updateDraft(request.id, 'comment', event.target.value)} maxLength={2000} rows={4} /></td>
                    <td><button className="admin-save" type="button" onClick={() => void saveRequest(request.id)} disabled={savingId === request.id}><Save size={16} /> {savingId === request.id ? 'СОХРАНЕНИЕ' : 'СОХРАНИТЬ'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
