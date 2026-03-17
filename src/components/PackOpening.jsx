import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Share2, ArrowLeft, Trophy } from 'lucide-react';

export default function PackOpening({ cards, onClose }) {
  const [revealedIdxs, setRevealedIdxs] = useState([]);
  const [highestRarity, setHighestRarity] = useState('Common');

  useEffect(() => {
    let highest = 'Common';
    const rarities = cards.map(c => c.rarity);
    if (rarities.includes('Legendary')) highest = 'Legendary';
    else if (rarities.includes('Epic')) highest = 'Epic';
    else if (rarities.includes('Rare')) highest = 'Rare';
    setHighestRarity(highest);
  }, [cards]);

  const revealCard = (idx) => {
    if (!revealedIdxs.includes(idx)) {
      setRevealedIdxs([...revealedIdxs, idx]);
    }
  };

  const allRevealed = revealedIdxs.length === cards.length;

  const handleShare = () => {
    const text = `I just pulled some sick cards on RipPack! MVP pulls are going crazy! 🚀📦 #RipPack #MemeCards`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ padding: '4rem 0', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 className="orbitron headline-neon" style={{ fontSize: '2.5rem', color: `var(--rarity-${highestRarity.toLowerCase()})` }}>
          {allRevealed ? 'PACK OPENED' : 'PULLING...'}
        </h2>
        <p className="hero-sub" style={{ fontSize: '1rem' }}>
          {allRevealed ? 'Amazing collection! Flex your pulls.' : 'Click cards to reveal your destiny.'}
        </p>
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        {cards.map((c, i) => {
          const isRevealed = revealedIdxs.includes(i);
          return (
            <div 
              key={i} 
              className={`card-container ${isRevealed ? 'revealed' : ''}`}
              onClick={() => revealCard(i)}
              style={{ cursor: isRevealed ? 'default' : 'pointer' }}
            >
              <div className="card-3d">
                <div className="card-face card-back">
                  <div className="orbitron" style={{ opacity: 0.2, fontSize: '3rem', fontWeight: 900 }}>RIP</div>
                </div>
                <div className={`card-face card-front rarity-${c.rarity}`}>
                  <img src={`/cards/${c.image_url}`} alt={c.name} className="card-img" />
                  <div className="card-info-overlay">
                    <div className="orbitron" style={{ fontSize: '0.85rem', color: `var(--rarity-${c.rarity.toLowerCase()})`, marginBottom: '0.25rem' }}>
                      {c.rarity.toUpperCase()}
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '1rem' }}>{c.name}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {allRevealed && (
        <div style={{ marginTop: '5rem', textAlign: 'center', maxWidth: '600px', margin: '5rem auto 0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
            <button className="btn btn-outline" onClick={onClose}>
              <ArrowLeft size={18} /> DASHBOARD
            </button>
            <Link to="/inventory">
              <button className="btn btn-primary" style={{ height: '100%' }}>
                VIEW INVENTORY
              </button>
            </Link>
          </div>
          
          {(highestRarity === 'Epic' || highestRarity === 'Legendary') && (
            <div className="share-panel">
              <div style={{ marginBottom: '1.5rem', display: 'inline-flex', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', color: 'var(--rarity-legendary)' }}>
                <Trophy size={32} />
              </div>
              <h3 className="orbitron" style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>INSANE PULL!</h3>
              <p className="hero-sub" style={{ marginBottom: '2rem' }}>You hit a {highestRarity}! Flex it on the timeline.</p>
              <button className="btn" style={{ background: '#1DA1F2', color: '#fff', border: 'none' }} onClick={handleShare}>
                <Share2 size={18} /> SHARE ON X
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
