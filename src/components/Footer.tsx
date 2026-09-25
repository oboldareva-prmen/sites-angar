import { MapPin, MessageCircle, Send } from 'lucide-react';
import witchIcon from '/TW2.png';

export function Footer() {
  return (
    <footer className="footer" id="contacts">
      <div className="container footer-inner">

        {/* Адрес */}
        <div className="contact">
          <div className="contact-title">
            <MapPin size={24} />
            <strong>Вавилова, 2/2</strong>
          </div>
          <span>МЫ ЖДЕМ ТЕБЯ</span>
        </div>

        {/* Телефон */}
        <div className="contact">
          <div className="contact-title">
            <MessageCircle size={24} />
            <strong>75-33-44</strong>
          </div>
          <span>Позвони. Узнай. Начни.</span>
        </div>

        {/* Разработчик */}
        <div className="contact">
          <div className="contact-title">
            <strong>Разработано:</strong>

            <span className="developer-name">
              <img
                src={witchIcon}
                alt=""
                className="witch-icon"
              />
              Techno_Witch
            </span>
          </div>

          <div className="telegram">
            <Send size={22} />
            <span>@OV_Bolshedvorskaya</span>
          </div>
        </div>

        {/* Правообладатель */}
        <div className="contact">
          <div className="contact-title">
            <strong>Правообладатель:</strong>
          </div>
          <span>ЦФП «АНГАР» · © 2026</span>
        </div>

      </div>
    </footer>
  );
}