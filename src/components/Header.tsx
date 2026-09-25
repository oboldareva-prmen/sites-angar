import { Menu, X } from 'lucide-react';

type HeaderProps = { menuOpen: boolean; onToggle: () => void; onNavigate: () => void };

export function Header({ menuOpen, onToggle, onNavigate }: HeaderProps) {
  return (
    <header className="header container">
      <a className="brand" href="#top" aria-label="Ангар">
        <span className="brand-name"><svg className="brand-a" viewBox="0 0 28 36" role="img" aria-label="А"><polygon points="14,0 28,36 0,36" fill="url(#goldGrad)" /><polygon points="14,11 21,30 7,30" fill="#03090B" /><defs><linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFD978" /><stop offset="100%" stopColor="#D6A52E" /></linearGradient></defs></svg>НГАР</span>
        <span className="brand-caption">ЦЕНТР ФУНКЦИОНАЛЬНОЙ ПОДГОТОВКИ</span>
      </a>
      <nav className={menuOpen ? 'nav nav-open' : 'nav'} aria-label="Основная навигация">
        <a className="active" href="#programs" onClick={onNavigate}>ПРОГРАММЫ</a>
        <a href="#about" onClick={onNavigate}>ТРЕНЕРЫ</a>
        <a href="#programs" onClick={onNavigate}>ЗАЛ</a>
        <a href="#contacts" onClick={onNavigate}>КОНТАКТЫ</a>
      </nav>
      <button className="menu-button" onClick={onToggle} aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}>
        {menuOpen ? <X size={30} /> : <Menu size={32} />}
      </button>
    </header>
  );
}
