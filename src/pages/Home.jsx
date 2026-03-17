import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Package, Zap, Archive, Store } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleOpen = () => {
    if (!user?.packs || user.packs < 1) { alert('No packs available! Visit the shop.'); return; }
    navigate('/open-pack');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050505' }}>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem' }}>
        {/* Hero */}
        <div className="glass" style={{ borderRadius: 24, padding: '3rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 300, height: 300, background: 'rgba(0,255,148,0.12)', borderRadius: '50%', filter: 'blur(80px)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 className="font-display" style={{ fontSize: '2.5rem', textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: '1rem' }}>Ready to Rip?</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: '2rem' }}>
              <Package size={28} color="#00FF94" />
              <span className="font-display" style={{ fontSize: '3rem', color: '#00FF94', fontWeight: 800 }}>{user?.packs || 0}</span>
              <span style={{ color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.9rem' }}>Packs Available</span>
            </div>
            <button className="btn-primary animate-pulse-glow" onClick={handleOpen} disabled={!user?.packs || user.packs < 1} style={{ fontSize: '1.1rem', padding: '18px 48px' }}>
              <Zap size={22} /> Open Pack
            </button>
          </div>
        </div>

        {/* Nav cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { to: '/inventory', icon: Archive, label: 'Collection', color: '#00FF94' },
            { to: '/shop', icon: Store, label: 'Shop', color: '#8B5CF6' },
          ].map(({ to, icon: Icon, label, color }) => (
            <Link key={to} to={to} className="glass" style={{ borderRadius: 16, padding: '1.5rem', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 8, transition: 'border-color 0.2s', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = color + '40'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            >
              <Icon size={32} color={color} />
              <span style={{ color: '#9CA3AF', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.08em' }}>{label}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
