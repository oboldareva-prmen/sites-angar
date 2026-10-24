import { Phone } from 'lucide-react';

type FloatingCallbackProps = {
  visible: boolean;
  onOpen: () => void;
};

export function FloatingCallback({ visible, onOpen }: FloatingCallbackProps) {
  return (
    <button
      className={`floating-callback${visible ? ' is-visible' : ''}`}
      type="button"
      onClick={onOpen}
      aria-label="Заказать обратный звонок"
      aria-expanded={visible}
    >
      <Phone size={20} strokeWidth={2} />
      <span>ЗАКАЗАТЬ ЗВОНОК</span>
    </button>
  );
}
