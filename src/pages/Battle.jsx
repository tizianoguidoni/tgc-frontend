import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Swords, Shield, Trophy, X, Zap, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const RARITY_COLOR = {
  Common: '#9CA3AF', Rare: '#3B82F6', Epic: '#8B5CF6', Legendary: '#EAB308'
};

function calcAttack(card) {
  const bonus = { Common: 0, Rare: 10, Epic: 25, Legendary: 50 };
  return Math.round(card.power + (card.sigma * 0.5) + (card.based * 0.3) + (bonus[card.rarity] || 0));
}

function CardMini({ card, selected, onClick, disabled, showAttack }) {
  const color = RARITY_COLOR[card.rarity] || '#9CA3AF';
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      style={{
        borderRadius: 14, overflow: 'hidden', cursor: disabled ? 'default' : 'pointer',
        border: `2px solid ${selected ? '#00FF94' : color + '60'}`,
        boxShadow: selected ? '0 0 20px rgba(0,255,148,0.4)' : 'none',
        transition: 'all 0.2s', transform: selected ? 'scale(1.05)' : 'scale(1)',
        background: '#0A0A0A', position: 'relative', width: 120
      }}
    >
      <img src={card.image_url} alt={card.name}
        style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }}
        onError={e => { e.target.src = `https://placehold.co/120x100/111/${color.replace('#','')}/png?text=${encodeURIComponent(card.name)}`; }}
      />
      <div style={{ padding: '6px 8px' }}>
        <div style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.name}</div>
        <div style={{ color, fontSize: '0.65rem', textTransform: 'uppercase' }}>{card.rarity}</div>
        {showAttack && <div style={{ color: '#00FF94', fontSize: '0.7rem', marginTop: 2 }}>⚡ {calcAttack(card)}</div>}
      </div>
      {selected && <div style={{ position: 'absolute', top: 4, right: 4, background: '#00FF94', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>}
    </div>
  );
}

function RoundResult({ playerCard, botCard, playerWins }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);
  return (
    <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0.8)', transition: 'all 0.4s', display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'center' }}>
        <img src={playerCard.image_url} alt={playerCard.name} style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 12, border: `2px solid ${playerWins ? '#00FF94' : '#EF4444'}` }} onError={e => e.target.style.display='none'} />
        <div style={{ color: '#fff', fontSize: '0.8rem', marginTop: 4 }}>{playerCard.name}</div>
        <div style={{ color: '#00FF94', fontSize: '0.85rem', fontWeight: 700 }}>⚡ {calcAttack(playerCard)}</div>
      </div>
      <div style={{ fontSize: '1.5rem', fontFamily: 'Orbitron', color: playerWins ? '#00FF94' : '#EF4444' }}>
        {playerWins ? 'WIN' : 'LOSE'}
      </div>
      <div style={{ textAlign: 'center' }}>
        <img src={botCard.image_url} alt={botCard.name} style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 12, border: `2px solid ${!playerWins ? '#00FF94' : '#EF4444'}` }} onError={e => e.target.style.display='none'} />
        <div style={{ color: '#fff', fontSize: '0.8rem', marginTop: 4 }}>{botCard.name}</div>
        <div style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 700 }}>⚡ {calcAttack(botCard)}</div>
      </div>
    </div>
  );
}

export default function Battle() {
  const { token, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [stage, setStage] = useState('select'); // select | battle | result
  const [inventory, setInventory] = useState([]);
  const [selected, setSelected] = useState([]);
  const [battleId, setBattleId] = useState(null);
  const [botCards, setBotCards] = useState([]);
  const [playerCards, setPlayerCards] = useState([]);
  const [usedPlayerCards, setUsedPlayerCards] = useState([]);
  const [roundResults, setRoundResults] = useState([]);
  const [scores, setScores] = useState({ player: 0, bot: 0 });
  const [battleStatus, setBattleStatus] = useState('active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/packs/inventory`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : (data.cards || []);
        setInventory(arr.map(i => i.card || i));
      });
  }, [token]);

  const toggleSelect = (card) => {
    if (selected.find(c => c.id === card.id)) {
      setSelected(selected.filter(c => c.id !== card.id));
    } else if (selected.length < 3) {
      setSelected([...selected, card]);
    }
  };

  const startBattle = async () => {
    if (selected.length !== 3) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/battle/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_ids: selected.map(c => c.id) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed');
      setBattleId(data.battle_id);
      setBotCards(data.bot_cards);
      setPlayerCards(data.player_cards);
      setStage('battle');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const playCard = async (card) => {
    if (loading || usedPlayerCards.includes(card.id)) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/battle/play`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ battle_id: battleId, card_id: card.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed');
      setUsedPlayerCards(prev => [...prev, card.id]);
      setRoundResults(prev => [...prev, { playerCard: data.player_card, botCard: data.bot_card, playerWins: data.player_wins_round }]);
      setScores({ player: data.player_score, bot: data.bot_score });
      setBattleStatus(data.battle_status);
      if (data.battle_status !== 'active') {
        await fetchUser();
        setTimeout(() => setStage('result'), 1200);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const playerWon = battleStatus === 'player_won';

  return (
    <div style={{ minHeight: '100vh', background: '#050505' }}>
      <Navbar />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>

        {/* STAGE: SELECT */}
        {stage === 'select' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
              <Swords size={32} color="#EF4444" />
              <h1 className="font-display" style={{ fontSize: '2rem', textTransform: 'uppercase' }}>Battle</h1>
            </div>
            <div className="glass" style={{ borderRadius: 16, padding: '1.25rem', marginBottom: '1.5rem' }}>
              <p style={{ color: '#9CA3AF', marginBottom: '0.5rem' }}>Select <strong style={{ color: '#00FF94' }}>3 cards</strong> from your collection to battle the bot. Win 2 rounds to earn a free pack!</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${selected[i-1] ? '#00FF94' : 'rgba(255,255,255,0.15)'}`, background: selected[i-1] ? 'rgba(0,255,148,0.1)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: selected[i-1] ? '#00FF94' : '#52525B' }}>
                    {selected[i-1] ? '✓' : i}
                  </div>
                ))}
                <span style={{ color: '#52525B', fontSize: '0.85rem', alignSelf: 'center', marginLeft: 8 }}>{selected.length}/3 selected</span>
              </div>
            </div>
            {error && <div style={{ color: '#EF4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            {inventory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#52525B' }}>
                <Shield size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p>No cards yet! Open packs first.</p>
                <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>Get Packs</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: '2rem' }}>
                  {inventory.map(card => (
                    <CardMini key={card.id} card={card} selected={!!selected.find(c => c.id === card.id)} onClick={() => toggleSelect(card)} disabled={selected.length >= 3 && !selected.find(c => c.id === card.id)} showAttack />
                  ))}
                </div>
                <button className="btn-primary" onClick={startBattle} disabled={selected.length !== 3 || loading} style={{ fontSize: '1rem', padding: '16px 40px' }}>
                  {loading ? '...' : <><Swords size={18} /> Start Battle</>}
                </button>
              </>
            )}
          </div>
        )}

        {/* STAGE: BATTLE */}
        {stage === 'battle' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div className="font-display" style={{ fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: 8 }}>Round {roundResults.length + 1} / 3</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '2rem', color: '#00FF94', fontWeight: 700 }}>{scores.player}</div><div style={{ color: '#52525B', fontSize: '0.75rem' }}>YOU</div></div>
                <div style={{ color: '#52525B', fontSize: '1.5rem', alignSelf: 'center' }}>vs</div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '2rem', color: '#EF4444', fontWeight: 700 }}>{scores.bot}</div><div style={{ color: '#52525B', fontSize: '0.75rem' }}>BOT</div></div>
              </div>
            </div>

            {roundResults.length > 0 && (
              <div className="glass" style={{ borderRadius: 16, padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ color: '#52525B', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 8 }}>Last Round</div>
                <RoundResult {...roundResults[roundResults.length - 1]} />
              </div>
            )}

            <div className="glass" style={{ borderRadius: 16, padding: '1.25rem' }}>
              <div style={{ color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {roundResults.length < 3 ? 'Choose a card to play:' : 'Battle complete!'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {playerCards.map(card => {
                  const used = usedPlayerCards.includes(card.id);
                  return (
                    <div key={card.id} style={{ opacity: used ? 0.35 : 1, transition: 'all 0.2s' }}>
                      <CardMini card={card} selected={false} onClick={() => !used && playCard(card)} disabled={used || loading} showAttack />
                      {used && <div style={{ textAlign: 'center', color: '#52525B', fontSize: '0.7rem', marginTop: 4 }}>Used</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ color: '#52525B', fontSize: '0.8rem', marginBottom: 8 }}>Bot's cards (face up):</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {botCards.map((card, i) => (
                  <div key={card.id} style={{ opacity: i < roundResults.length ? 0.4 : 1 }}>
                    <CardMini card={card} selected={false} disabled showAttack />
                  </div>
                ))}
              </div>
            </div>
            {error && <div style={{ color: '#EF4444', marginTop: '1rem', fontSize: '0.9rem' }}>{error}</div>}
          </div>
        )}

        {/* STAGE: RESULT */}
        {stage === 'result' && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>{playerWon ? '🏆' : '💀'}</div>
            <h2 className="font-display" style={{ fontSize: '3rem', textTransform: 'uppercase', color: playerWon ? '#00FF94' : '#EF4444', marginBottom: '0.5rem' }}>
              {playerWon ? 'Victory!' : 'Defeat!'}
            </h2>
            <div style={{ color: '#9CA3AF', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
              {scores.player} — {scores.bot}
            </div>
            {playerWon && (
              <div className="glass" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, borderRadius: 12, padding: '0.75rem 1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(0,255,148,0.3)' }}>
                <span style={{ fontSize: '1.5rem' }}>📦</span>
                <span style={{ color: '#00FF94', fontFamily: 'Orbitron', textTransform: 'uppercase', fontSize: '0.9rem' }}>+1 Pack Earned!</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: '2rem' }}>
              {roundResults.map((r, i) => (
                <div key={i} style={{ background: r.playerWins ? 'rgba(0,255,148,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${r.playerWins ? 'rgba(0,255,148,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 10, padding: '0.5rem 1rem', fontSize: '0.8rem', color: r.playerWins ? '#00FF94' : '#EF4444' }}>
                  Round {i+1}: {r.playerWins ? 'WIN' : 'LOSS'}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => { setStage('select'); setSelected([]); setBotCards([]); setPlayerCards([]); setUsedPlayerCards([]); setRoundResults([]); setScores({player:0,bot:0}); setBattleStatus('active'); }}>
                <Swords size={16} /> Battle Again
              </button>
              <button className="btn-secondary" onClick={() => navigate('/')}>
                Back to Home
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
