import { ArrowRight, Play } from 'lucide-react';

type HeroProps = { onVideoOpen: () => void };

export function Hero({ onVideoOpen }: HeroProps) {
  return (
    <div className="hero-content container" id="top">
      <div className="hero-copy">
        <p className="eyebrow">СИЛЬНЫЕ ЛЮДИ · ЗДОРОВОЕ ТЕЛО · СЧАСТЛИВАЯ ЖИЗНЬ</p>
        <h1>ТВОЙ КЛУБ <em>рядом</em></h1>
        <p className="hero-text">В 5 МИНУТАХ ОТ ВАШЕГО ДОМА —<br />КЛУБ, ГДЕ ВАС ЗНАЮТ<br />ПО ИМЕНИ, А НЕ ПО НОМЕРУ<br />БРАСЛЕТА.</p>
        <div className="hero-actions">
          <a className="primary-button" href="#programs">ВЫБРАТЬ ПРОГРАММУ <ArrowRight size={20} /></a>
          <button className="play-link" onClick={onVideoOpen} aria-label="Смотреть видео о клубе"><span className="play-circle"><Play size={18} fill="currentColor" /></span><span>СМОТРЕТЬ<br />ВИДЕО О КЛУБЕ</span></button>
        </div>
      </div>
      <div className="hero-slogan">Свой круг.<br /><span>Свой результат</span></div>
    </div>
  );
}
