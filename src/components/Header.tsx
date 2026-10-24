export function Header() {
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

      <nav className="header-nav" aria-label="Основные разделы">
        <a href="#top">ОСНОВНОЕ</a>
        <a href="#programs">ПРОГРАММЫ</a>
        <a href="#trainers">ТРЕНЕРЫ</a>
      </nav>
    </header>
  );
}
