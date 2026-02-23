import React, { useState } from 'react';

const PasswordModal = ({ isOpen, onClose, onSubmit, loading, error }) => {
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(password);
    setPassword('');
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.35)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '32px 28px', minWidth: 320, boxShadow: '0 4px 32px #0002', position: 'relative'
      }}>
        <button onClick={onClose} style={{position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer'}}>×</button>
        <h2 style={{marginBottom: 18, fontWeight: 700, fontSize: '1.2em'}}>Enter PDF Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="PDF password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #ccc', marginBottom: 16, fontSize: 16}}
          />
          <button type="submit" disabled={loading} style={{width: '100%', background: 'linear-gradient(90deg,#1976d2,#43a7fd)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #1976d255'}}>
            {loading ? 'Unlocking...' : 'Submit Password'}
          </button>
        </form>
        {error && <div style={{color: 'red', marginTop: 12, fontSize: 15}}>{error}</div>}
      </div>
    </div>
  );
};

export default PasswordModal;
