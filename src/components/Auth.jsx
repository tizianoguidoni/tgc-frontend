import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ChevronRight } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('INVALID CREDENTIALS OR SYSTEM TIMEOUT');
      }
    } else {
      const success = await register(email, password);
      if (success) {
        const loginSuccess = await login(email, password);
        if (loginSuccess) navigate('/');
      } else {
        setError('REGISTRATION FAILED. PROTOCOL VIOLATION.');
      }
    }
  };

  return (
    <div style={{ padding: '6rem 0', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '3.5rem 2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="headline-neon orbitron" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            {isLogin ? 'ACCESS TERMINAL' : 'NEW PROTOCOL'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isLogin ? 'Initialize secure session to continue.' : 'Register unique identifier in the network.'}
          </p>
        </div>
        
        {error && <div className="error-msg" style={{ fontSize: '0.8rem', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.1em' }} className="orbitron">
              <Mail size={12} style={{ marginRight: '6px' }} /> EMAIL IDENTIFIER
            </label>
            <input 
              type="email" 
              className="form-control" 
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1rem', color: '#ffffff' }}
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="operator@rippack.network"
              required 
            />
          </div>
          <div className="form-group" style={{ marginBottom: '2.5rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.1em' }} className="orbitron">
              <Lock size={12} style={{ marginRight: '6px' }} /> ENCRYPTION KEY
            </label>
            <input 
              type="password" 
              className="form-control" 
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1rem', color: '#ffffff' }}
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '54px' }}>
            {isLogin ? 'INITIALIZE SESSION' : 'EXECUTE REGISTRATION'} <ChevronRight size={18} />
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button 
            className="btn" 
            style={{ padding: '0', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem' }} 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "DON'T HAVE AN UPLINK? REGISTER" : 'ALREADY REGISTERED? LOGIN'}
          </button>
        </div>
      </div>
    </div>
  );
}
