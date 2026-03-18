import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Archive, Sparkles, Zap, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const RARITY = {
  Common:    { text: '#9CA3AF', border: 'rgba(156,163,175,0.4)', glow: 'glow-common',     next: 'Rare',      needed: 3 },
  Rare:      { text: '#3B82F6', border: 'rgba(59,130,246,0.5)',  glow: 'glow-rare',       next: 'Epic',      needed: 5 },
  Epic:      { text: '#8B5CF6', border: 'rgba(139,92,246,0.5)',  glow: 'glow-epic',       next: 'Legendary', needed: 8 },
  Legendary: { text: '#EAB308', border: 'rgba(234,179,8,0.6)',   glow: 'glow-legendary',  next: null,        needed: null },
};

// ─── EVOLUTION ANIMATION ────────────────────────────────────────────────────
function EvolutionOverlay({ fromCard, toCard, onDone }) {
  const [phase, setPhase] = useState('flash'); // flash → silhouette → reveal → done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('silhouette'), 600);
    const t2 = setTimeout(() => setPhase('reveal'), 2000);
    const t3 = setTimeout(() => { setPhase('done'); onDone(); }, 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: phase === 'flash' ? 'white' : phase === 'reveal' ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.95)',
      transition: 'background 0.5s',
    }}>
      {/* Flash bianco iniziale */}
      {phase === 'flash' && (
        <div style={{ color: '#000', fontFamily: 'Orbitron, sans-serif', fontSize: '2rem', fontWeight: 900, letterSpacing: '0.2em' }}>
          EVOLVING...
        </div>
      )}

      {/* Silhouette che pulsa */}
      {phase === 'silhouette' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
          <div style={{ position: 'relative', width: 260, height: 360 }}>
            <img src={fromCard.image_url} alt={fromCard.name} style={{
              width: '100%', height: '100%', objectFit: 'cover', borderRadius: 20,
              filter: 'brightness(10) saturate(0)',
              animation: 'pulse-silhouette 0.4s ease-in-out infinite alternate',
            }} />
            {/* Particelle */}
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} style={{
                position: 'absolute',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: 8, height: 8, borderRadius: '50%',
                background: '#00FF94',
                animation: `particle-out 1s ease-out ${i * 0.05}s forwards`,
                '--tx': `${(Math.random() - 0.5) * 400}px`,
                '--ty': `${(Math.random() - 0.5) * 400}px`,
              }} />
            ))}
          </div>
          <div className="font-display" style={{ color: '#00FF94', fontSize: '1.2rem', letterSpacing: '0.15em', animation: 'pulse-dot 0.3s ease-in-out infinite' }}>
            FUSING...
          </div>
        </div>
      )}

      {/* Rivelazione carta evoluta */}
      {(phase === 'reveal' || phase === 'done') && toCard && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div className="font-display" style={{ color: RARITY[toCard.rarity]?.text || '#fff', fontSize: '1rem', letterSpacing: '0.2em', marginBottom: 8 }}>
            ✨ {toCard.rarity.toUpperCase()} UNLOCKED ✨
          </div>
          <div className={`animate-reveal ${RARITY[toCard.rarity]?.glow}`} style={{
            width: 260, height: 360, borderRadius: 20, overflow: 'hidden',
            border: `2px solid ${RARITY[toCard.rarity]?.border}`, position: 'relative',
          }}>
            <img src={toCard.image_url} alt={toCard.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%)' }} />
            <div className="holo" style={{ position: 'absolute', inset: 0 }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem' }}>
              <div className="font-display" style={{ color: RARITY[toCard.rarity]?.text, fontSize: '1rem', textTransform: 'uppercase' }}>{toCard.name}</div>
              <div className="font-display" style={{ color: RARITY[toCard.rarity]?.text, fontSize: '0.65rem', opacity: 0.8, marginTop: 4 }}>{toCard.rarity}</div>
              {toCard.flavor && <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontStyle: 'italic', marginTop: 4 }}>{toCard.flavor}</div>}
            </div>
            {/* Particelle finali */}
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i} className="particle" style={{
                top: '50%', left: '50%',
                background: RARITY[toCard.rarity]?.text || '#fff',
                '--tx': `${(Math.random() - 0.5) * 400}px`,
                '--ty': `${(Math.random() - 0.5) * 400}px`,
                animationDelay: `${i * 0.04}s`
              }} />
            ))}
          </div>
          <button className="btn-primary" onClick={onDone}><Zap size={16} /> Awesome!</button>
        </div>
      )}

      <style>{`
        @keyframes pulse-silhouette {
          from { filter: brightness(10) saturate(0); }
          to   { filter: brightness(3) saturate(0) blur(2px); }
        }
      `}</style>
    </div>
  );
}

// ─── FUSION MODAL ────────────────────────────────────────────────────────────
function FusionModal({ item, onClose, onFuse }) {
  const card = item.card || item;
  const rarity = RARITY[card.rarity];
  const count = item.count || 1;
  const canFuse = rarity.needed && count >= rarity.needed;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass" style={{ borderRadius: 24, padding: '2rem', maxWidth: 380, width: '100%', border: `1px solid ${rarity.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className="font-display" style={{ color: rarity.text, fontSize: '1rem', textTransform: 'uppercase' }}>{card.name}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        {/* Card preview */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div className={rarity.glow} style={{ width: 140, height: 196, borderRadius: 12, overflow: 'hidden', border: `2px solid ${rarity.border}`, position: 'relative' }}>
            <img src={card.image_url} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
              <div style={{ color: rarity.text, fontSize: '0.6rem', fontFamily: 'Orbitron, sans-serif', textTransform: 'uppercase' }}>{card.rarity}</div>
            </div>
          </div>
        </div>

        {/* Fusion info */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ color: '#9CA3AF', fontSize: '0.85rem', marginBottom: 8 }}>
            Hai <span style={{ color: rarity.text, fontWeight: 700 }}>{count}x</span> {card.name}
          </div>

          {rarity.needed ? (
            <>
              <div style={{ color: '#52525B', fontSize: '0.75rem', marginBottom: '1rem' }}>
                Fondi <strong style={{ color: '#fff' }}>{rarity.needed}x {card.rarity}</strong> → ottieni 1x <strong style={{ color: RARITY[rarity.next]?.text }}>{rarity.next}</strong>
              </div>

              {/* Progress bar */}
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 9999, height: 8, marginBottom: '0.5rem' }}>
                <div style={{
                  height: '100%', borderRadius: 9999,
                  background: rarity.text,
                  width: `${Math.min(100, (count / rarity.needed) * 100)}%`,
                  transition: 'width 0.3s',
                  boxShadow: `0 0 8px ${rarity.text}`,
                }} />
              </div>
              <div style={{ color: '#52525B', fontSize: '0.7rem' }}>{count}/{rarity.needed} carte</div>
            </>
          ) : (
            <div style={{ color: rarity.text, fontFamily: 'Orbitron, sans-serif', fontSize: '0.8rem' }}>RARITY MASSIMA</div>
          )}
        </div>

        {/* Fusion button */}
        {rarity.needed && (
          <button
            onClick={() => canFuse && onFuse(card)}
            disabled={!canFuse}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', opacity: canFuse ? 1 : 0.3 }}
          >
            <Sparkles size={16} />
            {canFuse ? `Fondi ${rarity.needed}x → 1x ${rarity.next}` : `Mancano ${rarity.needed - count} carte`}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Inventory() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [evolution, setEvolution] = useState(null); // { fromCard, toCard }

  const fetchInventory = useCallback(() => {
    fetch(`${API_URL}/packs/inventory`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setItems(Array.isArray(data) ? data : (data.cards || [])))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const handleFuse = async (card) => {
    setSelectedItem(null);
    try {
      const res = await fetch(`${API_URL}/packs/fuse`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_name: card.name })
      });
      if (!res.ok) throw new Error('Fusion failed');
      const newCard = await res.json();
      setEvolution({ fromCard: card, toCard: newCard });
    } catch (e) {
      alert('Fusione fallita: ' + e.message);
    }
  };

  const handleEvolutionDone = () => {
    setEvolution(null);
    fetchInventory();
  };

  const filtered = filter === 'all' ? items : items.filter(i => (i.card?.rarity || i.rarity) === filter);

  const stats = {
    total: items.length,
    legendary: items.filter(i => (i.card?.rarity || i.rarity) === 'Legendary').length,
    epic: items.filter(i => (i.card?.rarity || i.rarity) === 'Epic').length,
    rare: items.filter(i => (i.card?.rarity || i.rarity) === 'Rare').length,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050505' }}>
      <Navbar />

      {/* Evolution overlay */}
      {evolution && <EvolutionOverlay fromCard={evolution.fromCard} toCard={evolution.toCard} onDone={handleEvolutionDone} />}

      {/* Fusion modal */}
      {selectedItem && <FusionModal item={selectedItem} onClose={() => setSelectedItem(null)} onFuse={handleFuse} />}

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
          <Archive size={32} color="#00FF94" />
          <h1 className="font-display" style={{ fontSize: '2.5rem', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Collection</h1>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
          {[
            { label: 'Unique Cards', value: stats.total, color: '#00FF94' },
            { label: 'Completion',   value: `${Math.round(stats.total / 17 * 100)}%`, color: '#fff' },
            { label: 'Legendary',    value: stats.legendary, color: '#EAB308' },
            { label: 'Epic',         value: stats.epic,      color: '#8B5CF6' },
            { label: 'Rare',         value: stats.rare,      color: '#3B82F6' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass" style={{ borderRadius: 14, padding: '1rem', textAlign: 'center' }}>
              <div className="font-display" style={{ fontSize: '1.8rem', color, fontWeight: 700 }}>{value}</div>
              <div style={{ fontSize: '0.7rem', color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Fusion hint */}
        <div className="glass" style={{ borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={16} color="#00FF94" />
          <span style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
            <span style={{ color: '#00FF94' }}>Fusion:</span> 3x Common → Rare &nbsp;|&nbsp; 5x Rare → Epic &nbsp;|&nbsp; 8x Epic → Legendary. Clicca una carta per fondere.
          </span>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '2rem' }}>
          {['all', 'Legendary', 'Epic', 'Rare', 'Common'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 20px', borderRadius: 9999, border: 'none', cursor: 'pointer', fontSize: '0.8rem',
              fontFamily: 'Orbitron, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'all 0.2s',
              background: filter === f ? '#00FF94' : 'rgba(255,255,255,0.05)',
              color: filter === f ? '#000' : '#9CA3AF', fontWeight: filter === f ? 700 : 400
            }}>
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#00FF94', fontFamily: 'Orbitron, sans-serif' }} className="animate-pulse">Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#52525B' }}>
            <Sparkles size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p>No cards yet — open packs to collect!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 150px))', gap: 16, justifyContent: 'start' }}>
            {filtered.map((item, idx) => {
              const card = item.card || item;
              const r = RARITY[card.rarity] || RARITY.Common;
              const count = item.count || 1;
              const canFuse = r.needed && count >= r.needed;

              return (
                <div
                  key={idx}
                  className={r.glow}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    borderRadius: 16, overflow: 'hidden', border: `2px solid ${canFuse ? r.text : r.border}`,
                    position: 'relative', aspectRatio: '3/4', cursor: 'pointer', transition: 'transform 0.2s',
                    boxShadow: canFuse ? `0 0 20px ${r.text}80` : undefined,
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06) translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
                >
                  <img src={card.image_url} alt={card.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => e.target.src = 'https://via.placeholder.com/200x280?text=' + card.name}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)' }} />
                  <div className="holo" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />

                  {/* Fusion badge */}
                  {canFuse && (
                    <div style={{ position: 'absolute', top: 8, right: 8, background: r.text, color: '#000', borderRadius: 6, padding: '2px 6px', fontSize: '0.6rem', fontFamily: 'Orbitron, sans-serif', fontWeight: 700 }}>
                      FUSE!
                    </div>
                  )}

                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.75rem' }}>
                    <div className="font-display" style={{ color: r.text, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{card.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <span style={{ color: r.text, fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.8 }}>{card.rarity}</span>
                      {count > 1 && <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.65rem', padding: '2px 8px', borderRadius: 9999 }}>x{count}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
