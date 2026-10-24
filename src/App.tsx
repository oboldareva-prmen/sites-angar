import { useState } from 'react';
import { X } from 'lucide-react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Benefits } from '@/components/Benefits';
import { Programs } from '@/components/Programs';
import { Trainers } from '@/components/Trainers';
import { Footer } from '@/components/Footer';
import { CallbackModal } from '@/components/CallbackModal';
import { CallbackCta } from '@/components/CallbackCta';
import { LegalDocument } from '@/components/LegalDocument';
import { AdminRequestsPage } from '@/components/AdminRequestsPage';

const heroImage = '/angar_hero2.jpg';

function App() {
  const path = window.location.pathname;

  if (path === '/consent' || path === '/privacy') {
    return <LegalDocument kind={path.slice(1) as 'consent' | 'privacy'} />;
  }

  if (path === '/admin/requests') return <AdminRequestsPage />;

  return <SiteApp />;
}

function SiteApp() {
  const [videoOpen, setVideoOpen] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);

  return (
    <>
      <main className="site-shell">
        <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="hero-overlay" />
          <Header />
          <Hero onVideoOpen={() => setVideoOpen(true)} />
        </section>
        <Benefits />
        <CallbackCta headingId="benefits-callback-title" onOpen={() => setCallbackOpen(true)} />
        <Programs />
        <CallbackCta headingId="programs-callback-title" onOpen={() => setCallbackOpen(true)} />
        <Trainers />
        <CallbackCta headingId="trainers-callback-title" onOpen={() => setCallbackOpen(true)} />
        <Footer />
      </main>

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
