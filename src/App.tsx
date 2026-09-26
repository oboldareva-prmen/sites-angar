import { useState } from 'react';
import { X } from 'lucide-react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Benefits } from '@/components/Benefits';
import { Programs } from '@/components/Programs';
import { Footer } from '@/components/Footer';

const heroImage = '/angar_hero2.jpg';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

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
        <Footer />
      </main>

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
