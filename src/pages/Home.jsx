import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Package, Zap, Archive, Store, Trophy, Gift, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const FAKE_FEED = [
  { user: 'gio***@gmail.com', card: 'Gigachad', rarity: 'Epic', time: '2m ago', color: '#8B5CF6' },
  { user: 'mar***@hotmail.com', card: 'Illuminati Triangle', rarity: 'Legendary', time: '5m ago', color: '#EAB308' },
  { user: 'ale***@gmail.com', card: 'Doge', rarity: 'Rare', time: '8m ago', color: '#3B82F6' },
  { user: 'fra***@gmail.com', card: 'Grumpy Cat', rarity: 'Common', time: '11m ago', color: '#9CA3AF' },
  { user: 'val***@yahoo.com', card: 'Cyber Doge', rarity: 'Epic', time: '14m ago', color: '#8B5CF6' },
  { user: 'luc***@gmail.com', card: 'Stonks Man', rarity: 'Rare', time: '18m ago', color: '#3B82F6' },
  { user: 'mat***@gmail.com', card: 'Disaster Girl', rarity: 'Rare', time: '23m ago', color: '#3B82F6' },
  { user: 'ste***@icloud.com', card: 'Nyan Cat', rarity: 'Rare', time: '31m ago', color: '#3B82F6' },
];

export default function Home() {
  const { user, token, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [canDaily, setCanDaily] = useState(false);
  const [hoursLeft, setHoursLeft] = useState(0);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (user?.last_login) {
      const last = new Date(user.last_login);
      const hours = (new Date() - last) / 3600000;
      setCanDaily(hours >= 24);
      setHoursLeft(Math.max(0, Math.ceil(24 - hours)));
    } else {
      setCanDaily(true);
    }
  }, [user]);

  const claimDaily = async () => {
    setClaiming(true);
    try {
      await fetch(`${API_URL}/packs/daily`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      await fetchUser();
      setCanDaily(false);
    } catch {}
    setClaiming(false);
  };

  const handleOpen = () => {
    if (!user?.packs || user.packs < 1) { alert('No packs! Visit the shop.'); return; }
    navigate('/open-pack');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050505' }}>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Hero */}
            <div className="glass" style={{ borderRadius: 24, padding: '2.5rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 300, height: 300, background: 'rgba(0,255,148,0.1)', borderRadius: '50%', filter: 'blur(80px)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 className="font-display" style={{ fontSize: '2.2rem', textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: '1rem' }}>Ready to Rip?</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: '1.75rem' }}>
                  <Package size={26} color="#00FF94" />
                  <span className="font-display" style={{ fontSize: '3rem', color: '#00FF94', fontWeight: 800 }}>{user?.packs || 0}</span>
                  <span style={{ color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.85rem' }}>Packs Available</span>
                </div>
                <button className="btn-primary animate-pulse-glow" onClick={handleOpen} disabled={!user?.packs || user.packs < 1} style={{ fontSize: '1rem', padding: '16px 44px', marginBottom: '1rem' }}>
                  <Zap size={20} /> Open Pack
                </button>
                <div>
                  {canDaily ? (
                    <button className="btn-secondary" onClick={claimDaily} disabled={claiming} style={{ fontSize: '0.8rem' }}>
                      <Gift size={16} /> {claiming ? 'Claiming...' : 'Claim Daily Pack'}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#52525B', fontSize: '0.85rem' }}>
                      <Clock size={14} /> Next daily in {hoursLeft}h
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Nav cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[
                { to: '/inventory', icon: Archive, label: 'Collection', color: '#00FF94', sub: `${user?.packs || 0} packs` },
                { to: '/leaderboard', icon: Trophy, label: 'Leaderboard', color: '#EAB308', sub: 'Top collectors' },
                { to: '/shop', icon: Store, label: 'Shop', color: '#8B5CF6', sub: 'Get more packs' },
              ].map(({ to, icon: Icon, label, color, sub }) => (
                <Link key={to} to={to} className="glass" style={{ borderRadius: 16, padding: '1.25rem', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 6, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = color + '40'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <Icon size={28} color={color} />
                  <div className="font-display" style={{ color: '#fff', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                  <div style={{ color: '#52525B', fontSize: '0.75rem' }}>{sub}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right — Feed */}
          <div className="glass" style={{ borderRadius: 20, padding: '1.25rem', display: 'flex', flexDirection: 'column', height: 'fit-content', maxHeight: 520, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
              <span style={{ width: 8, height: 8, background: '#00FF94', borderRadius: '50%' }} className="animate-pulse" />
              <span className="font-display" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff' }}>Live Pulls</span>
            </div>
            <div className="mask-fade" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FAKE_FEED.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: item.color + '15', border: `1px solid ${item.color}30` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: item.color + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>🎴</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: item.color, fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.card}</div>
                    <div style={{ color: '#52525B', fontSize: '0.7rem' }}>{item.user}</div>
                  </div>
                  <div style={{ color: '#52525B', fontSize: '0.65rem', flexShrink: 0 }}>{item.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
