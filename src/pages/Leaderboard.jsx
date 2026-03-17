import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Trophy, Crown, Medal } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Leaderboard() {
  const { token } = useAuth();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/packs/inventory`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {})
      .catch(() => {});
    // Use a simple mock since backend doesn't have leaderboard yet
    setBoard([]);
    setLoading(false);
  }, [token]);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={24} color="#EAB308" />;
    if (rank === 2) return <Medal size={24} color="#D1D5DB" />;
    if (rank === 3) return <Medal size={24} color="#B45309" />;
    return <span style={{ color: '#52525B', fontFamily: 'Orbitron', fontSize: '1rem', width: 24, textAlign: 'center' }}>{rank}</span>;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050505' }}>
      <Navbar />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: '0.75rem' }}>
            <Trophy size={36} color="#EAB308" />
            <h1 className="font-display" style={{ fontSize: '2.8rem', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Leaderboard</h1>
          </div>
          <p style={{ color: '#9CA3AF' }}>Top collectors ranked by legendary pulls</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#00FF94', fontFamily: 'Orbitron' }} className="animate-pulse">Loading...</div>
        ) : board.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#52525B' }}>
            <Trophy size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>No collectors yet — be the first!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {board.map((entry, i) => (
              <div key={i} className="glass" style={{ borderRadius: 16, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: 16, border: i === 0 ? '1px solid rgba(234,179,8,0.3)' : '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 32, display: 'flex', justifyContent: 'center' }}>{getRankIcon(i + 1)}</div>
                <div style={{ flex: 1 }}>
                  <div className="font-display" style={{ fontSize: '1rem' }}>{entry.email}</div>
                  <div style={{ fontSize: '0.75rem', color: '#52525B' }}>{entry.unique} unique • {entry.total} total</div>
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ textAlign: 'center' }}><div style={{ color: '#EAB308', fontWeight: 700, fontSize: '1.2rem' }}>{entry.legendary}</div><div style={{ fontSize: '0.65rem', color: '#52525B' }}>Legendary</div></div>
                  <div style={{ textAlign: 'center' }}><div style={{ color: '#8B5CF6', fontWeight: 700, fontSize: '1.2rem' }}>{entry.epic}</div><div style={{ fontSize: '0.65rem', color: '#52525B' }}>Epic</div></div>
                  <div style={{ textAlign: 'center' }}><div style={{ color: '#3B82F6', fontWeight: 700, fontSize: '1.2rem' }}>{entry.rare}</div><div style={{ fontSize: '0.65rem', color: '#52525B' }}>Rare</div></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
