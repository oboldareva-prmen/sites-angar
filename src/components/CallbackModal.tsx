import { FormEvent, useEffect, useState } from 'react';
import { X } from 'lucide-react';

type CallbackModalProps = {
  open: boolean;
  onClose: () => void;
};

type FormValues = {
  name: string;
  phone: string;
  time: string;
  consent: boolean;
};

const initialValues: FormValues = {
  name: '',
  phone: '',
  time: '',
  consent: false,
};

export function CallbackModal({ open, onClose }: CallbackModalProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [error, setError] = useState('');
  const [consentError, setConsentError] = useState('');
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (open) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') onClose();
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }

    setValues(initialValues);
    setError('');
    setConsentError('');
    setUnavailable(false);
    return undefined;
  }, [onClose, open]);

  if (!open) return null;

  const isDirty = Object.values(values).some(Boolean);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setConsentError('');
    setUnavailable(false);

    if (!values.phone.trim()) {
      setError('Укажите номер телефона.');
      return;
    }

    if (!values.consent) {
      setConsentError('Для отправки заявки необходимо дать согласие на обработку персональных данных');
      return;
    }

    setUnavailable(true);
  };

  const handleBackdropClick = () => {
    if (!isDirty) onClose();
  };

  return (
    <div className="callback-modal" role="dialog" aria-modal="true" aria-labelledby="callback-title" onClick={handleBackdropClick}>
      <div className="callback-dialog" onClick={(event) => event.stopPropagation()}>
        <button className="callback-close" type="button" onClick={onClose} aria-label="Закрыть форму">
          <X size={22} />
        </button>
        <p className="eyebrow">МЫ ПЕРЕЗВОНИМ</p>
        <h2 id="callback-title">ЗАКАЗАТЬ ОБРАТНЫЙ ЗВОНОК</h2>
        <p className="callback-intro">Оставьте контакты, и мы свяжемся с вами, чтобы ответить на вопросы.</p>

        <form onSubmit={handleSubmit} noValidate>
          <label>
            Имя
            <input
              type="text"
              value={values.name}
              onChange={(event) => setValues({ ...values, name: event.target.value })}
              autoComplete="name"
              autoFocus
            />
          </label>
          <label>
            Телефон <span>*</span>
            <input
              type="tel"
              value={values.phone}
              onChange={(event) => setValues({ ...values, phone: event.target.value })}
              autoComplete="tel"
              required
            />
          </label>
          <label>
            Удобное время для звонка
            <input
              type="text"
              value={values.time}
              onChange={(event) => setValues({ ...values, time: event.target.value })}
              placeholder="Например, после 18:00"
            />
          </label>
          <label className="callback-consent">
            <input
              type="checkbox"
              checked={values.consent}
              onChange={(event) => {
                setValues({ ...values, consent: event.target.checked });
                setConsentError('');
              }}
              aria-describedby={consentError ? 'consent-error' : undefined}
              required
            />
            <span>
              Я согласен(на) на обработку персональных данных и ознакомился(лась) с{' '}
              <a href="/privacy" target="_blank" rel="noreferrer">Политикой обработки персональных данных</a>{' '}
              и <a href="/consent" target="_blank" rel="noreferrer">Согласием на обработку персональных данных</a>.
            </span>
          </label>
          {consentError && <p className="callback-message callback-error" id="consent-error" role="alert">{consentError}</p>}
          {error && <p className="callback-message callback-error" role="alert">{error}</p>}
          {unavailable && <p className="callback-message callback-unavailable" role="status">Форма проверена, но доставка заявок пока не подключена.</p>}
          <button className="callback-submit" type="submit">ЗАКАЗАТЬ ЗВОНОК</button>
        </form>
      </div>
    </div>
  );
}
