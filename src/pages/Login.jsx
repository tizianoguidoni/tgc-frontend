import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Sparkles, ChevronRight } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const ok = await login(email, password);
        if (ok) navigate('/');
        else setError('Invalid credentials');
      } else {
        const ok = await register(email, password);
        if (ok) {
          const ok2 = await login(email, password);
          if (ok2) navigate('/');
        } else {
          setError('Registration failed');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', top: '20%', left: '20%', width: 400, height: 400, background: 'rgba(112,0,255,0.15)', borderRadius: '50%', filter: 'blur(120px)' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: 400, height: 400, background: 'rgba(0,255,148,0.12)', borderRadius: '50%', filter: 'blur(120px)' }} />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1
            className="font-display glitch-text"
            data-text="RIPPACK"
            style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-0.03em', textTransform: 'uppercase', marginBottom: '0.75rem' }}
          >
            <span className="gradient-text">RIPPACK</span>
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '1rem' }}>Open packs. Collect cards. Share wins.</p>
        </div>

        {/* Card */}
        <div className="glass" style={{ borderRadius: 20, padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.75rem' }}>
            <Sparkles size={20} color="#00FF94" />
            <h2 className="font-display" style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {isLogin ? 'Enter the Game' : 'New Protocol'}
            </h2>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '0.75rem 1rem', color: '#F87171', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: '#9CA3AF', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Orbitron, sans-serif' }}>
                <Mail size={11} style={{ display: 'inline', marginRight: 5 }} />Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,255,148,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: '#9CA3AF', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Orbitron, sans-serif' }}>
                <Lock size={11} style={{ display: 'inline', marginRight: 5 }} />Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,255,148,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: 52, marginTop: '0.5rem', fontSize: '0.9rem' }}>
              {loading ? (
                <span style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin" />
              ) : (
                <>{isLogin ? 'Initialize Session' : 'Execute Registration'} <ChevronRight size={18} /></>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{ background: 'none', border: 'none', color: '#52525B', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              {isLogin ? "Don't have an account? Register" : 'Already registered? Login'}
            </button>
          </div>
        </div>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: '2rem', textAlign: 'center' }}>
          {[['🎴', 'Collect Cards'], ['✨', 'Epic Animations'], ['🏆', 'Compete']].map(([emoji, label]) => (
            <div key={label} style={{ padding: '1rem 0' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: 6 }}>{emoji}</div>
              <div style={{ fontSize: '0.7rem', color: '#52525B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
