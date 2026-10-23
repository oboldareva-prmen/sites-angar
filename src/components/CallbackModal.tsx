import { FormEvent, useEffect, useState } from 'react';
import { X } from 'lucide-react';

type CallbackModalProps = {
  open: boolean;
  onClose: () => void;
};

type FormValues = {
  name: string;
  phone: string;
  consent: boolean;
};

type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

const initialValues: FormValues = { name: '', phone: '', consent: false };

function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

export function CallbackModal({ open, onClose }: CallbackModalProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [idempotencyKey, setIdempotencyKey] = useState(newIdempotencyKey);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');

  useEffect(() => {
    if (open) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }

    setValues(initialValues);
    setIdempotencyKey(newIdempotencyKey());
    setError('');
    setStatus('idle');
    return undefined;
  }, [onClose, open]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!values.phone.trim()) {
      setError('Укажите номер телефона.');
      setStatus('error');
      return;
    }
    if (!values.consent) {
      setError('Для отправки заявки необходимо дать согласие на обработку персональных данных.');
      setStatus('error');
      return;
    }

    setStatus('sending');
    try {
      const response = await fetch('/api/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
        body: JSON.stringify({ name: values.name, phone: values.phone, consent: values.consent }),
      });
      const result = await response.json().catch(() => null) as { accepted?: unknown; notification?: unknown } | null;
      if (!response.ok || result?.accepted !== true) throw new Error('request_failed');

      setValues(initialValues);
      setIdempotencyKey(newIdempotencyKey());
      setStatus('success');
      if (result.notification === 'failed') setError('Заявка сохранена, но уведомление владельцу пока не доставлено.');
    } catch {
      setError('Не удалось отправить заявку. Попробуйте ещё раз.');
      setStatus('error');
    }
  };

  return (
    <div className="callback-modal" role="dialog" aria-modal="true" aria-labelledby="callback-title" onClick={() => { if (status !== 'sending') onClose(); }}>
      <div className="callback-dialog" onClick={(event) => event.stopPropagation()}>
        <button className="callback-close" type="button" onClick={onClose} aria-label="Закрыть форму"><X size={22} /></button>
        <p className="eyebrow">МЫ ПЕРЕЗВОНИМ</p>
        <h2 id="callback-title">ЗАКАЗАТЬ ОБРАТНЫЙ ЗВОНОК</h2>
        <p className="callback-intro">Оставьте контакты, и мы свяжемся с вами, чтобы ответить на вопросы.</p>

        {status === 'success' ? (
          <div className="callback-success" role="status">
            <strong>Заявка принята.</strong>
            <p>{error || 'Мы свяжемся с вами в ближайшее время.'}</p>
            <button className="callback-submit" type="button" onClick={onClose}>ЗАКРЫТЬ</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <label>
              Имя
              <input type="text" value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} autoComplete="name" autoFocus />
            </label>
            <label>
              Телефон <span>*</span>
              <input type="tel" value={values.phone} onChange={(event) => setValues({ ...values, phone: event.target.value })} autoComplete="tel" required />
            </label>
            <label className="callback-consent">
              <input type="checkbox" checked={values.consent} onChange={(event) => setValues({ ...values, consent: event.target.checked })} required />
              <span>
                Я согласен(на) на обработку персональных данных и ознакомился(лась) с{' '}
                <a href="/consent" target="_blank" rel="noreferrer">Согласием на обработку персональных данных</a>.
              </span>
            </label>
            {error && <p className="callback-message callback-error" role="alert">{error}</p>}
            <button className="callback-submit" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'ОТПРАВКА...' : 'ЗАКАЗАТЬ ЗВОНОК'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
