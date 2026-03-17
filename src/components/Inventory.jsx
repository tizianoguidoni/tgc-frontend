import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Trophy, Search } from 'lucide-react';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/packs/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInventory(data);
      }
    } catch (err) {
      console.error("Failed to fetch inventory", err);
    } finally {
      setLoading(false);
    }
  };

  const totalCollected = inventory.length;
  const maxCards = 17;
  const progressPercent = Math.round((totalCollected / maxCards) * 100);

  if (loading) return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <div className="animate-glow" style={{ color: 'var(--primary-neon)' }}>LOADING COLLECTION...</div>
    </div>
  );

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '2rem' }}>
        <div>
          <h2 className="orbitron headline-neon" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            VAULT
          </h2>
          <p className="hero-sub" style={{ margin: 0, textAlign: 'left' }}>
            Your personal collection of viral digital artifacts.
          </p>
        </div>
        
        <div style={{ textAlign: 'right', minWidth: '300px' }}>
          <div className="orbitron" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            COLLECTION PROGRESS: {totalCollected} / {maxCards}
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${progressPercent}%`, 
                height: '100%', 
                background: 'var(--gradient-neon)',
                boxShadow: '0 0 15px var(--primary-glow)',
                transition: 'width 1s ease-out'
              }} 
            />
          </div>
        </div>
      </div>

      {inventory.length === 0 ? (
        <div className="offer-card" style={{ margin: '4rem auto', maxWidth: '500px', display: 'flex', flexDirection: 'column' }}>
          <Trophy size={48} color="var(--text-disabled)" style={{ marginBottom: '1.5rem', alignSelf: 'center' }} />
          <h3 className="orbitron" style={{ marginBottom: '1rem' }}>VAULT IS EMPTY</h3>
          <p className="hero-sub" style={{ marginBottom: '2rem' }}>You haven't collected any cards yet. Start your journey by ripping some packs.</p>
          <Link to="/shop" className="btn btn-primary" style={{ alignSelf: 'center' }}>GO TO SHOP</Link>
        </div>
      ) : (
        <div className="inventory-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '3rem' }}>
          {inventory.map((item, idx) => (
            <div key={idx} className="inventory-item" style={{ position: 'relative' }}>
              <div className={`card-face card-front rarity-${item.card.rarity}`} style={{ position: 'relative', height: '310px', width: '220px', display: 'flex', flexDirection: 'column' }}>
                <img src={`/cards/${item.card.image_url}`} alt={item.card.name} className="card-img" />
                <div className="card-info-overlay">
                  <div className="orbitron" style={{ fontSize: '0.75rem', color: `var(--rarity-${item.card.rarity.toLowerCase()})`, marginBottom: '0.2rem' }}>
                    {item.card.rarity.toUpperCase()}
                  </div>
                  <div style={{ fontWeight: '800' }}>{item.card.name}</div>
                </div>
                <div className="badge-count orbitron" style={{ 
                  position: 'absolute', 
                  top: '-10px', 
                  right: '-10px', 
                  zIndex: 2,
                  background: 'var(--primary-neon)',
                  color: 'var(--bg-deep)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '900',
                  boxShadow: '0 0 15px var(--primary-glow)',
                  border: '2px solid var(--bg-deep)'
                }}>
                  {item.count}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
