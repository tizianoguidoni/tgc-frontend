import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PackOpening from './PackOpening';
import { PackageOpen, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { user, fetchUser, token } = useAuth();
  const [opening, setOpening] = useState(false);
  const [pulledCards, setPulledCards] = useState([]);
  const [error, setError] = useState('');

  const handleOpenPack = async () => {
    if (user.packs < 1) return;
    setError('');
    
    try {
      const res = await fetch('/api/packs/open', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const cards = await res.json();
        setPulledCards(cards);
        setOpening(true);
        fetchUser(); // Update pack count
      } else {
        const err = await res.json();
        setError(err.detail || 'Failed to open pack');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleCloseOpening = () => {
    setOpening(false);
    setPulledCards([]);
  };

  if (opening) {
    return <PackOpening cards={pulledCards} onClose={handleCloseOpening} />;
  }

  return (
    <div className="hero-visuals">
      <h1 className="hero-headline orbitron">
        RIP YOUR <span className="headline-neon">PACKS</span>
      </h1>
      <p className="hero-sub">
        Collect 17 viral meme cards. Hit the <span style={{ color: 'var(--rarity-legendary)', fontWeight: '700' }}>Legendary Illuminati Triangle</span> and claim your place in history.
      </p>
      
      {error && <div className="error-msg">{error}</div>}
      
      <div className="pack-display" style={{ marginTop: '2rem' }}>
        <div className="pack-card">
          <div className="pack-icon-container animate-glow">
            <PackageOpen size={40} color="var(--primary-neon)" />
          </div>
          <h2 className="orbitron" style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#fff' }}>
            MVP PROTOCOL
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: '1.5' }}>
            Contains 5 random cards from the core collection. High probability of rare drops.
          </p>
          <button 
            className="btn btn-primary" 
            onClick={handleOpenPack}
            disabled={user?.packs < 1}
            style={{ width: '100%' }}
          >
            {user?.packs > 0 ? (
              <>
                <Sparkles size={18} /> OPEN PACK ({user.packs})
              </>
            ) : (
              'NO PACKS AVAILABLE'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
