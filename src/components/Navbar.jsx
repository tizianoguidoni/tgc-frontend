import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Flame, LogOut, LayoutGrid, ShoppingBag } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        RIP<span className="brand-accent">PACK</span>
      </Link>
      
      {user && (
        <>
          <div className="nav-links">
            <Link to="/inventory" className={`nav-link ${location.pathname === '/inventory' ? 'active' : ''}`}>
              <LayoutGrid size={18} /> INVENTORY
            </Link>
            <Link to="/shop" className={`nav-link ${location.pathname === '/shop' ? 'active' : ''}`}>
              <ShoppingBag size={18} /> SHOP
            </Link>
          </div>
          
          <div className="user-status-pill">
            <div className="stat-item" title="Available Packs">
              <Package size={18} color="var(--primary-neon)" />
              <span className="orbitron">{user.packs}</span>
            </div>
            <div className="stat-item" title="Login Streak">
              <Flame size={18} color="var(--rarity-legendary)" />
              <span className="orbitron">{user.streak}</span>
            </div>
            <button 
              className="btn" 
              style={{ background: 'transparent', padding: '0', height: 'auto', border: 'none', color: 'var(--text-secondary)' }} 
              onClick={logout} 
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </>
      )}
    </nav>
  );
}
