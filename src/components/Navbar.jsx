import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Archive, Store, LogOut, Package, Menu, X, Trophy } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const nav = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/inventory', icon: Archive, label: 'Collection' },
    { path: '/leaderboard', icon: Trophy, label: 'Ranks' },
    { path: '/shop', icon: Store, label: 'Shop' },
  ];

  const active = (p) => location.pathname === p;

  return (
    <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link to="/" className="font-display" style={{ color: '#00FF94', fontSize: '1.2rem', textDecoration: 'none', letterSpacing: '0.05em' }}>RIPPACK</Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {nav.map(({ path, icon: Icon, label }) => (
            <Link key={path} to={path} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, textDecoration: 'none',
              color: active(path) ? '#00FF94' : '#9CA3AF', background: active(path) ? 'rgba(0,255,148,0.08)' : 'transparent',
              fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s'
            }}>
              <Icon size={16} />{label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: 9999 }}>
            <Package size={14} color="#00FF94" />
            <span className="font-display" style={{ color: '#00FF94', fontSize: '0.85rem' }}>{user?.packs || 0}</span>
          </div>
          <span style={{ color: '#52525B', fontSize: '0.8rem', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</span>
          <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 8 }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
