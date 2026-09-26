import { Menu, X } from 'lucide-react';

type HeaderProps = {
  menuOpen: boolean;
  onToggle: () => void;
  onNavigate: () => void;
};

export function Header({ menuOpen, onToggle, onNavigate }: HeaderProps) {
  return (
    <header className="header container">
      <a className="brand" href="#top" aria-label="Ангар">

        <img
          className="brand-logo"
          src="/logo_angar.png"
          alt="АНГАР"
        />

        <span className="brand-caption">
          ЦЕНТР ФУНКЦИОНАЛЬНОЙ ПОДГОТОВКИ
        </span>

      </a>

      <nav
        className={menuOpen ? 'nav nav-open' : 'nav'}
        aria-label="Основная навигация"
      >
        <a className="active" href="#programs" onClick={onNavigate}>
          ПРОГРАММЫ
        </a>

        <a href="#about" onClick={onNavigate}>
          ТРЕНЕРЫ
        </a>

        <a href="#programs" onClick={onNavigate}>
          ЗАЛ
        </a>

        <a href="#contacts" onClick={onNavigate}>
          КОНТАКТЫ
        </a>
      </nav>

      <button
        className="menu-button"
        onClick={onToggle}
        aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
      >
        {menuOpen ? <X size={30} /> : <Menu size={32} />}
      </button>
    </header>
  );
}