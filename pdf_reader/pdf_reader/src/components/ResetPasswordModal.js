import React, { useState } from 'react';

const ResetPasswordModal = ({ username, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
    setSuccess('');
    if (!validatePassword(newPassword)) {
      setError('Password must be at least 8 characters, include uppercase and lowercase letters, and have no leading/trailing spaces.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/reset_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, new_password: newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setSuccess('Password reset successfully! You can now log in.');
      setTimeout(onClose, 2000);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 16, minWidth: 320, boxShadow: '0 4px 24px #0002', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>&times;</button>
        <h2 style={{ marginBottom: 18, color: '#1976d2' }}>Reset Password</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            style={{ padding: 10, borderRadius: 8, border: '1.5px solid #e3e8f0', fontSize: '1em' }}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            style={{ padding: 10, borderRadius: 8, border: '1.5px solid #e3e8f0', fontSize: '1em' }}
          />
          <button type="submit" disabled={loading} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: '1.1em', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        {error && <div style={{ color: '#b00020', marginTop: 12, fontWeight: 600 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginTop: 12, fontWeight: 600 }}>{success}</div>}
      </div>
    </div>
  );
};

export default ResetPasswordModal;
