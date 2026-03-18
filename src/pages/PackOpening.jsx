import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Sparkles, Share2, Zap } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const RARITY_STYLES = {
  Common:    { border: '#9CA3AF', text: '#9CA3AF', glow: 'glow-common' },
  Rare:      { border: '#3B82F6', text: '#3B82F6', glow: 'glow-rare' },
  Epic:      { border: '#8B5CF6', text: '#8B5CF6', glow: 'glow-epic' },
  Legendary: { border: '#EAB308', text: '#EAB308', glow: 'glow-legendary' },
};

// ─── WEB AUDIO SOUNDS ────────────────────────────────────────────────────────
function useSound() {
  const ctxRef = useRef(null);

  const getCtx = () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctxRef.current;
  };

  // Suono apertura pacchetto: rumore digitale + sweep filtro
  const playPackOpen = useCallback(() => {
    try {
      const ctx = getCtx();
      const duration = 1.2;

      // Noise buffer
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      // Filtro bandpass che sweeppa verso l'alto
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(8000, ctx.currentTime + duration);
      filter.Q.value = 3;

      // Gain envelope
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      // Oscillatore "data glitch"
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.3);
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.3, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      source.start();
      osc.start();
      source.stop(ctx.currentTime + duration);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) { /* silently fail if audio not supported */ }
  }, []);

  // Suono rivelazione carta leggendaria: accordo + shimmer
  const playLegendary = useCallback(() => {
    try {
      const ctx = getCtx();
      [261.63, 329.63, 392, 523.25].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.05);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.05 + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.05);
        osc.stop(ctx.currentTime + 2);
      });
    } catch (e) {}
  }, []);

  // Suono carta comune: click digitale
  const playCardReveal = useCallback((rarity) => {
    if (rarity === 'Legendary') { playLegendary(); return; }
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const freqs = { Common: 440, Rare: 660, Epic: 880 };
      osc.type = rarity === 'Epic' ? 'square' : 'sine';
      osc.frequency.value = freqs[rarity] || 440;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  }, [playLegendary]);

  return { playPackOpen, playCardReveal };
}

// ─── CARD REVEAL COMPONENT ───────────────────────────────────────────────────
function CardReveal({ card, onNext, hasMore }) {
  const style = RARITY_STYLES[card.rarity] || RARITY_STYLES.Common;
  const isEpicPlus = card.rarity === 'Epic' || card.rarity === 'Legendary';

  const handleShare = () => {
    const text = `Ho estratto una ${card.rarity.toUpperCase()} ${card.name} su RipPack! 🔥\n${window.location.origin}`;
    if (navigator.share) navigator.share({ title: 'RipPack Pull', text, url: window.location.origin });
    else navigator.clipboard.writeText(text);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
      <div
        className={`animate-reveal ${style.glow}`}
        style={{ width: 260, height: 360, borderRadius: 20, overflow: 'hidden', border: `2px solid ${style.border}`, position: 'relative' }}
      >
        <img src={card.image_url} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.src = `https://placehold.co/280x280/111/00FF94?text=${card.name}`; }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
        <div className="holo" style={{ position: 'absolute', inset: 0 }} />

        {/* Stats overlay */}
        {(card.power || card.sigma || card.based) && (
          <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[['⚡', card.power], ['😎', card.sigma], ['🔥', card.based]].map(([icon, val]) => val > 0 && (
              <div key={icon} style={{ background: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: '2px 6px', fontSize: '0.65rem', fontFamily: 'Orbitron, sans-serif', color: style.text }}>
                {icon} {val}
              </div>
            ))}
          </div>
        )}

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem' }}>
          <div className="font-display" style={{ color: style.text, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{card.name}</div>
          <div className="font-display" style={{ color: style.text, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 4, opacity: 0.8 }}>{card.rarity}</div>
          {card.flavor && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontStyle: 'italic', marginTop: 4 }}>{card.flavor}</div>}
        </div>

        {isEpicPlus && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="particle" style={{
                top: '50%', left: '50%', background: style.text,
                '--tx': `${(Math.random() - 0.5) * 300}px`,
                '--ty': `${(Math.random() - 0.5) * 300}px`,
                animationDelay: `${i * 0.05}s`
              }} />
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {isEpicPlus && (
          <button className="btn-secondary" onClick={handleShare}><Share2 size={16} /> Share Pull</button>
        )}
        {hasMore
          ? <button className="btn-primary" onClick={onNext}><Zap size={16} /> Next Card</button>
          : <button className="btn-primary" onClick={onNext}><Zap size={16} /> Open Another</button>
        }
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function PackOpening() {
  const { user, fetchUser, token } = useAuth();
  const navigate = useNavigate();
  const { playPackOpen, playCardReveal } = useSound();
  const [stage, setStage] = useState('idle');
  const [cards, setCards] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [error, setError] = useState('');

  const openPack = async () => {
    if (stage !== 'idle') return;
    setStage('shaking');
    setError('');
    playPackOpen();

    try {
      const res = await fetch(`${API_URL}/packs/open`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || 'Failed');
      }
      const data = await res.json();
      const cardArray = Array.isArray(data) ? data : [data];
      setTimeout(() => {
        setCards(cardArray);
        setCardIndex(0);
        setStage('revealed');
        playCardReveal(cardArray[0]?.rarity);
        fetchUser();
      }, 1200);
    } catch (e) {
      setError(e.message);
      setStage('idle');
    }
  };

  const handleNext = () => {
    if (cardIndex < cards.length - 1) {
      const next = cardIndex + 1;
      setCardIndex(next);
      playCardReveal(cards[next]?.rarity);
    } else {
      if (!user?.packs || user.packs < 1) {
        navigate('/shop');
      } else {
        setStage('idle');
        setCards([]);
        setCardIndex(0);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      {cards[cardIndex]?.rarity === 'Legendary' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(234,179,8,0.08)', pointerEvents: 'none' }} />
      )}

      <button className="btn-secondary" onClick={() => navigate('/')} style={{ position: 'absolute', top: 20, left: 20 }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="glass" style={{ position: 'absolute', top: 20, right: 20, borderRadius: 9999, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#00FF94', fontFamily: 'Orbitron, sans-serif', fontSize: '0.9rem' }}>{user?.packs || 0}</span>
        <span style={{ color: '#52525B', fontSize: '0.8rem' }}>packs</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        {stage === 'idle' && (
          <>
            <div
              className="animate-float glow-green"
              onClick={openPack}
              style={{ width: 260, height: 360, borderRadius: 20, cursor: 'pointer', background: 'linear-gradient(135deg, #1a1a2e 0%, #0A0A0A 100%)', border: '2px solid rgba(0,255,148,0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div className="holo" style={{ position: 'absolute', inset: 0 }} />
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
                <div className="font-display" style={{ color: '#00FF94', textTransform: 'uppercase', letterSpacing: '0.15em' }}>RipPack</div>
                <div style={{ color: '#52525B', fontSize: '0.8rem', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Click to Open</div>
              </div>
            </div>
            {error && <div style={{ color: '#F87171', fontSize: '0.9rem' }}>{error}</div>}
            <p style={{ color: '#52525B', fontSize: '0.9rem' }}>Click the pack to reveal your cards</p>
          </>
        )}

        {stage === 'shaking' && (
          <div className="animate-shake glow-green" style={{ width: 260, height: 360, borderRadius: 20, background: 'linear-gradient(135deg, #1a1a2e 0%, #0A0A0A 100%)', border: '2px solid rgba(0,255,148,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div className="holo" style={{ position: 'absolute', inset: 0 }} />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
              <div className="font-display" style={{ color: '#00FF94', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Opening...</div>
            </div>
          </div>
        )}

        {stage === 'revealed' && cards.length > 0 && (
          <>
            <div style={{ color: '#52525B', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Orbitron, sans-serif' }}>
              Card {cardIndex + 1} of {cards.length}
            </div>
            <CardReveal card={cards[cardIndex]} onNext={handleNext} hasMore={cardIndex < cards.length - 1} />
          </>
        )}
      </div>
    </div>
  );
}
