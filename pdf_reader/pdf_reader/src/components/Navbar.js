import React from 'react';




const Navbar = ({ tab, onTabChange, searchTerm, onSearchChange, user, onLogout, showAdminTab }) => (
  <nav className="App-nav" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
    <button onClick={() => onTabChange('home')} className="App-logo-link" aria-label="Home">
      <img src={require('../OIP.webp')} className="App-logo-small" alt="logo" />
    </button>
    <button className={tab === 'home' ? 'active' : ''} onClick={() => onTabChange('home')}>Home</button>
    <button className={tab === 'upload' ? 'active' : ''} onClick={() => onTabChange('upload')}>Upload</button>
    <button className={tab === 'history' ? 'active' : ''} onClick={() => onTabChange('history')}>History</button>
    <button className={tab === 'about' ? 'active' : ''} onClick={() => onTabChange('about')}>About</button>
    {/* Show Admin button for admin user on all tabs */}
    {showAdminTab && (
      <button className={tab === 'admin' ? 'active' : ''} onClick={() => onTabChange('admin')}>Admin Dashboard</button>
    )}
    <input
      type="text"
      placeholder="Search extracted text..."
      value={searchTerm}
      onChange={e => onSearchChange(e.target.value)}
      style={{ marginLeft: 'auto', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '180px' }}
    />
    {user && (
      <>
        <span style={{ marginLeft: 16, fontWeight: 500 }}>Hi, {user.username}</span>
        <button onClick={onLogout} style={{ marginLeft: 8, background: '#f44336', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Logout</button>
      </>
    )}
  </nav>
);

export default Navbar;
