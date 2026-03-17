import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Store, Package, Check, CreditCard, Zap } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Shop() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(null);

  const packages = [
    { id: '3_packs', name: 'Starter Bundle', packs: 3, price: '$2.99', features: ['3 Packs', 'Instant Delivery', 'Support the Dev'], popular: false },
    { id: '10_packs', name: 'Mega Bundle', packs: 10, price: '$7.99', features: ['10 Packs', 'Best Value', '20% Savings', 'Support the Dev'], popular: true },
  ];

  const handleBuy = async (packageId) => {
    setLoading(packageId);
    try {
      const res = await fetch(`${API_URL}/shop/checkout/${packageId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.checkout_url) window.location.href = data.checkout_url;
      else alert('Stripe not configured yet');
    } catch {
      alert('Checkout unavailable');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050505' }}>
      <Navbar />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: '0.75rem' }}>
            <Store size={36} color="#8B5CF6" />
            <h1 className="font-display" style={{ fontSize: '2.8rem', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Pack Shop</h1>
          </div>
          <p style={{ color: '#9CA3AF' }}>Get more packs and chase those legendaries!</p>
        </div>

        {/* Current packs */}
        <div className="glass" style={{ borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Package size={28} color="#00FF94" />
            <div>
              <div style={{ fontSize: '0.7rem', color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Packs</div>
              <div className="font-display" style={{ fontSize: '2rem', color: '#00FF94', fontWeight: 700 }}>{user?.packs || 0}</div>
            </div>
          </div>
          <Link to="/open-pack" className="btn-secondary"><Zap size={16} /> Open Packs</Link>
        </div>

        {/* Packages */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {packages.map(pkg => (
            <div key={pkg.id} className="glass" style={{
              borderRadius: 20, padding: '2rem', position: 'relative',
              border: pkg.popular ? '2px solid rgba(0,255,148,0.4)' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: pkg.popular ? '0 0 30px rgba(0,255,148,0.15)' : 'none',
              transition: 'transform 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {pkg.popular && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#00FF94', color: '#000', fontFamily: 'Orbitron, sans-serif', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', padding: '4px 16px', borderRadius: 9999, letterSpacing: '0.1em' }}>
                  Best Value
                </div>
              )}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', display: 'inline-block', fontSize: '3.5rem', marginBottom: '0.75rem' }}>
                  📦
                  <span style={{ position: 'absolute', top: -8, right: -12, background: '#7000FF', color: '#fff', fontSize: '0.7rem', fontWeight: 700, width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    x{pkg.packs}
                  </span>
                </div>
                <h3 className="font-display" style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>{pkg.name}</h3>
                <div className="font-display" style={{ fontSize: '2.5rem', color: '#00FF94', fontWeight: 700 }}>{pkg.price}</div>
              </div>
              <ul style={{ listStyle: 'none', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pkg.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: '#9CA3AF' }}>
                    <Check size={16} color="#00FF94" /> {f}
                  </li>
                ))}
              </ul>
              <button
                className={pkg.popular ? 'btn-primary' : 'btn-secondary'}
                onClick={() => handleBuy(pkg.id)}
                disabled={loading === pkg.id}
                style={{ width: '100%', height: 52 }}
              >
                {loading === pkg.id ? (
                  <span className="animate-spin" style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }} />
                ) : (
                  <><CreditCard size={18} /> Buy Now</>
                )}
              </button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', color: '#52525B', fontSize: '0.8rem', marginTop: '2rem' }}>
          Secure payments via Stripe • Cosmetic only • Just fun!
        </p>
      </main>
    </div>
  );
}
