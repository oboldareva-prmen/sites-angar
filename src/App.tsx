import { useState } from 'react';
import { PhoneCall, X } from 'lucide-react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Benefits } from '@/components/Benefits';
import { Programs } from '@/components/Programs';
import { Trainers } from '@/components/Trainers';
import { Footer } from '@/components/Footer';
import { CallbackModal } from '@/components/CallbackModal';

const heroImage = '/angar_hero2.jpg';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);

  return (
    <>
      <main className="site-shell">
        <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="hero-overlay" />
          <Header menuOpen={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} onNavigate={() => setMenuOpen(false)} />
          <Hero onVideoOpen={() => setVideoOpen(true)} />
        </section>
        <Benefits />
        <Programs />
        <Trainers />
        <Footer />
      </main>

      <button className="callback-floating-button" type="button" onClick={() => setCallbackOpen(true)}>
        <PhoneCall size={19} />
        <span>ЗАКАЗАТЬ ОБРАТНЫЙ ЗВОНОК</span>
      </button>

      <CallbackModal open={callbackOpen} onClose={() => setCallbackOpen(false)} />

      {videoOpen && (
        <div className="video-modal" role="dialog" aria-modal="true" aria-label="Видео о клубе" onClick={() => setVideoOpen(false)}>
          <button className="video-close" onClick={() => setVideoOpen(false)} aria-label="Закрыть видео"><X size={28} /></button>
          <div className="video-frame" onClick={(e) => e.stopPropagation()}>
            <div className="video-placeholder">
              <p>Видео о клубе АНГАР</p>
              <span>Здесь будет промо-видео клуба</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
