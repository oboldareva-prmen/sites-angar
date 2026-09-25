import { MapPin, MessageCircle, Send } from 'lucide-react';

export function Footer() {
  return (
    <footer className="footer" id="contacts">
      <div className="container footer-inner">
        <div className="contact"><MapPin size={24} /><div><strong>МЫ ЖДЕМ ТЕБЯ</strong><span>Вавилова, 2/2</span></div></div>
        <div className="contact"><MessageCircle size={24} /><div><strong>75-33-44</strong><span>Позвони. Узнай. Начни.</span></div></div>
        <div className="contact"><Send size={22} /><div><strong>@techno_witch737</strong><span>Мы на связи каждый день</span></div></div>
        <div className="contact credit"><div><strong>Разработано:</strong><span>Техно-ведьма</span></div></div>
      </div>
      <div className="container copyright">Правообладатель: ЦФП «АНГАР» · © 2026</div>
    </footer>
  );
}
