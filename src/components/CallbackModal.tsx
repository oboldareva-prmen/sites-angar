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
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const isDirty = Object.values(values).some(Boolean);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setUnavailable(false);

    if (!values.name.trim() || !values.phone.trim()) {
      setError('Заполните имя и телефон.');
      return;
    }

    if (!values.consent) {
      setError('Нужно согласиться на обработку персональных данных.');
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
            Имя <span>*</span>
            <input
              type="text"
              value={values.name}
              onChange={(event) => setValues({ ...values, name: event.target.value })}
              autoComplete="name"
              required
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
              onChange={(event) => setValues({ ...values, consent: event.target.checked })}
              required
            />
            <span>Согласен(а) на обработку персональных данных <b>*</b></span>
          </label>
          {error && <p className="callback-message callback-error" role="alert">{error}</p>}
          {unavailable && <p className="callback-message callback-unavailable" role="status">Форма готова, но отправка заявок пока не подключена.</p>}
          <button className="callback-submit" type="submit">ЗАКАЗАТЬ ЗВОНОК</button>
        </form>
      </div>
    </div>
  );
}
