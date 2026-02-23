import React, { useState } from 'react';

const AuthForm = ({ onAuth }) => {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Email and password validation rules
  function validateEmail(email) {
    // Must contain @ and . and follow a valid pattern, no leading/trailing spaces, no invalid chars
    const trimmed = email.trim();
    if (trimmed !== email) return false;
    // Basic pattern: username@domain.tld
    const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailPattern.test(email);
  }
  function validatePassword(pw) {
    if (pw.length < 8) return false;
    if (pw !== pw.trim()) return false;
    if (!/[a-z]/.test(pw)) return false;
    if (!/[A-Z]/.test(pw)) return false;
    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Validate email (username)
    if (!validateEmail(username)) {
      setError('Please enter a valid email address (e.g., user@example.com) with no spaces.');
      return;
    }
    // Validate password
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters, include uppercase and lowercase letters, and have no leading/trailing spaces.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        // If login mode and error is user not found, show a temporary warning
        if (mode === 'login' && (data.error && data.error.toLowerCase().includes('not found'))) {
          setError('User not found. Please create an account first using Register.');
          setTimeout(() => setError(''), 3500);
        } else {
          setError(data.error || 'Auth failed');
        }
        setLoading(false);
        return;
      }
      // Pass only user to parent
      onAuth(data.user || username);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: 380,
        margin: '3.5rem auto',
        padding: '2.5rem 2rem 2rem 2rem',
        borderRadius: 22,
        background: 'rgba(255,255,255,0.85)',
        boxShadow: '0 8px 32px rgba(31,38,135,0.13)',
        backdropFilter: 'blur(8px)',
        border: '1.5px solid #e3e8f0',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 18 }}>
        <div style={{
          background: 'linear-gradient(135deg,#a8edea,#fed6e3)',
          borderRadius: '50%',
          width: 64,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
          boxShadow: '0 2px 8px #a8edea55',
        }}>
          <span style={{ fontSize: 32 }}>{mode === 'login' ? '🔒' : '📝'}</span>
        </div>
        <h2 style={{ textAlign: 'center', fontWeight: 800, fontSize: '2rem', color: '#1976d2', margin: 0 }}>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input
          type="text"
          placeholder="Email"
          value={username}
          onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
          required
          autoComplete="username"
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: '1.5px solid #e3e8f0',
            fontSize: '1.08em',
            background: '#f7fafd',
            outline: 'none',
            marginBottom: 0,
            transition: 'border 0.2s',
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value.replace(/^\s+|\s+$/g, ''))}
          required
          autoComplete="current-password"
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 10,
            border: '1.5px solid #e3e8f0',
            fontSize: '1.08em',
            background: '#f7fafd',
            outline: 'none',
            marginBottom: 0,
            transition: 'border 0.2s',
          }}
        />
        {mode === 'login' && (
          <div style={{ textAlign: 'right', marginTop: 2, marginBottom: -8 }}>
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: '#1976d2',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.98em',
                textDecoration: 'underline',
                padding: 0,
              }}
              onClick={() => alert('Please contact admin to reset your password.')}
            >
              Forgot password?
            </button>
          </div>
        )}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px 0',
            background: 'linear-gradient(90deg,#1976d2,#43a7fd)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: '1.13em',
            letterSpacing: 0.5,
            boxShadow: '0 2px 8px #1976d255',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            marginTop: 4,
            transition: 'background 0.2s, opacity 0.2s',
          }}
          disabled={loading}
        >
          {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Register')}
        </button>
      </form>
      <div style={{ marginTop: 18, textAlign: 'center' }}>
        <button
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          style={{
            background: 'none',
            border: 'none',
            color: '#1976d2',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '1em',
            textDecoration: 'underline',
            marginTop: 0,
          }}
        >
          {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign In'}
        </button>
      </div>
      {error && <div style={{ color: '#b00020', marginTop: 14, fontWeight: 600, textAlign: 'center' }}>{error}</div>}
    </div>
  );
};

export default AuthForm;
