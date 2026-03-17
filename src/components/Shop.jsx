import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, ShoppingCart, Zap, TrendingUp } from 'lucide-react';

export default function Shop() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (packageId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shop/checkout/${packageId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Redirect to Stripe checkout
        window.location.href = data.checkout_url;
      } else {
        alert('Checkout failed');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
      setLoading(false);
    }
  };

  return (
    <div className="shop-wrapper">
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 className="headline-neon orbitron" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          THE SHOP
        </h2>
        <p className="hero-sub" style={{ fontSize: '1.1rem' }}>
          Upgrade your arsenal and dominate the leaderboard with premium packs.
        </p>
      </div>

      <div className="shop-grid">
        {/* Starter Bundle */}
        <div className="offer-card">
          <div style={{ color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.1em', fontSize: '0.8rem' }} className="orbitron">
            STARTER KIT
          </div>
          <div className="offer-price">
            <span className="currency-symbol">$</span>2.99
          </div>
          
          <ul className="offer-details">
            <li className="detail-item">
              <Check className="detail-check" size={18} />
              <span>3x MVP Packs (Core Edition)</span>
            </li>
            <li className="detail-item">
              <Check className="detail-check" size={18} />
              <span>15x Random Meme Cards</span>
            </li>
            <li className="detail-item">
              <Zap style={{ color: 'var(--text-disabled)' }} size={18} />
              <span style={{ color: 'var(--text-disabled)' }}>Standard Pull Rates</span>
            </li>
          </ul>

          <button 
            className="btn btn-outline" 
            style={{ width: '100%' }} 
            onClick={() => handleCheckout('3_packs')}
            disabled={loading}
          >
            {loading ? 'INITIALIZING...' : <><ShoppingCart size={18} /> SECURE PURCHASE</>}
          </button>
        </div>

        {/* Whale Bundle - FEATURED */}
        <div className="offer-card featured">
          <div style={{ color: 'var(--primary-neon)', fontWeight: '800', letterSpacing: '0.1em', fontSize: '0.8rem' }} className="orbitron">
            WHALE PROTOCOL
          </div>
          <div className="offer-price" style={{ color: 'var(--primary-neon)' }}>
            <span className="currency-symbol" style={{ color: 'var(--primary-neon-muted)' }}>$</span>7.99
          </div>
          
          <ul className="offer-details">
            <li className="detail-item">
              <Check className="detail-check" size={18} />
              <span style={{ color: '#fff', fontWeight: '600' }}>10x MVP Packs (High Voltage)</span>
            </li>
            <li className="detail-item">
              <Check className="detail-check" size={18} />
              <span style={{ color: '#fff', fontWeight: '600' }}>50x Random Meme Cards</span>
            </li>
            <li className="detail-item">
              <TrendingUp className="detail-check" size={18} />
              <span style={{ color: 'var(--primary-neon)' }}>Priority Support & Alpha Access</span>
            </li>
          </ul>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%' }} 
            onClick={() => handleCheckout('10_packs')}
            disabled={loading}
          >
            {loading ? 'INITIALIZING...' : <><Zap size={18} /> BUY NOW - SAVE 20%</>}
          </button>
        </div>
      </div>

      <div style={{ marginTop: '5rem', textAlign: 'center', opacity: 0.6 }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          All transactions are encrypted and processed securely by Stripe.
        </p>
      </div>
    </div>
  );
}
