import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Sparkles, Share2, Zap } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const RARITY_STYLES = {
  Common:    { border: '#9CA3AF', bg: 'from-gray-700 to-gray-900', text: '#9CA3AF', glow: 'glow-common' },
  Rare:      { border: '#3B82F6', bg: 'from-blue-600 to-blue-900',   text: '#3B82F6', glow: 'glow-rare' },
  Epic:      { border: '#8B5CF6', bg: 'from-purple-600 to-purple-900', text: '#8B5CF6', glow: 'glow-epic' },
  Legendary: { border: '#EAB308', bg: 'from-yellow-500 to-amber-700', text: '#EAB308', glow: 'glow-legendary' },
};

function CardReveal({ card, onNext, hasMore }) {
  const style = RARITY_STYLES[card.rarity] || RARITY_STYLES.Common;
  const isEpicPlus = card.rarity === 'Epic' || card.rarity === 'Legendary';

  const handleShare = () => {
    const text = `I just pulled a ${card.rarity.toUpperCase()} ${card.name} on RipPack! 🔥\n${window.location.origin}`;
    if (navigator.share) navigator.share({ title: 'RipPack Pull', text, url: window.location.origin });
    else { navigator.clipboard.writeText(text); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
      <div
        className={`animate-reveal ${style.glow}`}
        style={{
          width: 260, height: 360, borderRadius: 20, overflow: 'hidden',
          border: `2px solid ${style.border}`, position: 'relative'
        }}
      >
        <img src={card.image_url} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
        <div className="holo" style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem' }}>
          <div className="font-display" style={{ color: style.text, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{card.name}</div>
          <div className="font-display" style={{ color: style.text, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 4, opacity: 0.8 }}>{card.rarity}</div>
        </div>
        {/* Rarity particles for epic+ */}
        {isEpicPlus && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="particle" style={{
                top: '50%', left: '50%',
                background: style.text,
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
          <button className="btn-secondary" onClick={handleShare}>
            <Share2 size={16} /> Share Pull
          </button>
        )}
        {hasMore ? (
          <button className="btn-primary" onClick={onNext}><Zap size={16} /> Next Card</button>
        ) : (
          <button className="btn-primary" onClick={onNext}><Zap size={16} /> Open Another</button>
        )}
      </div>
    </div>
  );
}

export default function PackOpening() {
  const { user, fetchUser, token } = useAuth();
  const navigate = useNavigate();
  const [stage, setStage] = useState('idle'); // idle | shaking | revealed
  const [cards, setCards] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [error, setError] = useState('');

  const openPack = async () => {
    if (stage !== 'idle') return;
    setStage('shaking');
    setError('');

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
      // Backend returns array of cards
      const cardArray = Array.isArray(data) ? data : [data];
      setTimeout(() => {
        setCards(cardArray);
        setCardIndex(0);
        setStage('revealed');
        fetchUser();
      }, 1200);
    } catch (e) {
      setError(e.message);
      setStage('idle');
    }
  };

  const handleNext = () => {
    if (cardIndex < cards.length - 1) {
      setCardIndex(i => i + 1);
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
      {/* Bg blob for legendary */}
      {cards[cardIndex]?.rarity === 'Legendary' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(234,179,8,0.08)', pointerEvents: 'none' }} />
      )}

      {/* Back */}
      <button className="btn-secondary" onClick={() => navigate('/')} style={{ position: 'absolute', top: 20, left: 20 }}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Packs left */}
      <div className="glass" style={{ position: 'absolute', top: 20, right: 20, borderRadius: 9999, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#00FF94', fontFamily: 'Orbitron, sans-serif', fontSize: '0.9rem' }}>{user?.packs || 0}</span>
        <span style={{ color: '#52525B', fontSize: '0.8rem' }}>packs</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        {/* Pack or reveal */}
        {stage === 'idle' && (
          <>
            <div
              className={`animate-float glow-green`}
              onClick={openPack}
              style={{
                width: 260, height: 360, borderRadius: 20, cursor: 'pointer',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #0A0A0A 100%)',
                border: '2px solid rgba(0,255,148,0.25)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden', transition: 'transform 0.2s'
              }}
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
          <div
            className="animate-shake glow-green"
            style={{
              width: 260, height: 360, borderRadius: 20,
              background: 'linear-gradient(135deg, #1a1a2e 0%, #0A0A0A 100%)',
              border: '2px solid rgba(0,255,148,0.5)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden'
            }}
          >
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
            <CardReveal
              card={cards[cardIndex]}
              onNext={handleNext}
              hasMore={cardIndex < cards.length - 1}
            />
          </>
        )}
      </div>
    </div>
  );
}
