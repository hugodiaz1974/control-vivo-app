import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('hugo@controlvivo.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(result => {
      setIsLoading(false);
      if (result.status === 200) {
        localStorage.setItem('controlvivo_auth', 'true');
        localStorage.setItem('controlvivo_user', JSON.stringify(result.body.user));
        onLogin();
        navigate('/');
      } else {
        setError(result.body.error || 'Autenticación fallida');
      }
    })
    .catch(err => {
      setIsLoading(false);
      setError('Error conectando al servidor. Verifica que esté activo.');
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f111a 0%, #1e1b4b 100%)',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'rgba(30,32,40,0.7)',
        backdropFilter: 'blur(12px)',
        padding: '3rem 2.5rem',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-hover) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)'}}>
            Control<span style={{color: 'var(--accent-primary)'}}>Vivo</span>
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Acceso Corporativo Seguro
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)',
            color: '#fca5a5', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Correo Institucional</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'white', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s',
              }}
              className="login-input"
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <span>Contraseña</span>
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'white', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s',
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              width: '100%', padding: '0.875rem', borderRadius: '8px',
              backgroundColor: 'var(--accent-primary)', color: 'white',
              border: 'none', fontSize: '1rem', fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s, transform 0.1s',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Autenticando...' : 'Iniciar Sesión Módulo Riesgos'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Al ingresar confirmas que usarás el sistema según las <br/> políticas SAGRILAFT y de Control Interno corporativas.
        </div>
      </div>
    </div>
  );
};

export default Login;
