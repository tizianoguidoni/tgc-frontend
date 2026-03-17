import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Archive, Sparkles } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const RARITY = {
  Common:    { text: '#9CA3AF', border: 'rgba(156,163,175,0.4)', glow: 'glow-common' },
  Rare:      { text: '#3B82F6', border: 'rgba(59,130,246,0.5)',  glow: 'glow-rare' },
  Epic:      { text: '#8B5CF6', border: 'rgba(139,92,246,0.5)',  glow: 'glow-epic' },
  Legendary: { text: '#EAB308', border: 'rgba(234,179,8,0.6)',   glow: 'glow-legendary' },
};

export default function Inventory() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/packs/inventory`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        // data is array of { card, count } or just cards
        const arr = Array.isArray(data) ? data : (data.cards || []);
        setItems(arr);
      })
      .finally(() => setLoading(false));
  }, [token]);

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
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
          <Archive size={32} color="#00FF94" />
          <h1 className="font-display" style={{ fontSize: '2.5rem', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Collection</h1>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
          {[
            { label: 'Unique Cards', value: stats.total, color: '#00FF94' },
            { label: 'Completion', value: `${Math.round(stats.total / 17 * 100)}%`, color: '#fff' },
            { label: 'Legendary', value: stats.legendary, color: '#EAB308' },
            { label: 'Epic', value: stats.epic, color: '#8B5CF6' },
            { label: 'Rare', value: stats.rare, color: '#3B82F6' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass" style={{ borderRadius: 14, padding: '1rem', textAlign: 'center' }}>
              <div className="font-display" style={{ fontSize: '1.8rem', color, fontWeight: 700 }}>{value}</div>
              <div style={{ fontSize: '0.7rem', color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{label}</div>
            </div>
          ))}
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
              return (
                <div key={idx} className={r.glow} style={{
                  borderRadius: 16, overflow: 'hidden', border: `2px solid ${r.border}`,
                  position: 'relative', aspectRatio: '3/4', cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06) translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
                >
                  <img src={card.image_url} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.src='https://via.placeholder.com/200x280?text=' + card.name} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)' }} />
                  <div className="holo" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
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
