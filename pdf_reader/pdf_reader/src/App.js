import AdminDashboard from './components/AdminDashboard';


import React, { useState, useEffect } from 'react';
import './App.css';

import Navbar from './components/Navbar';
import UploadPanel from './components/UploadPanel';
import ExtractedTextPanel from './components/ExtractedTextPanel';
import AboutPanel from './components/AboutPanel';
import HistoryPanel from './components/HistoryPanel';
import AIAnalysisPanel from './components/AIAnalysisPanel';
import Chatbot from './components/Chatbot';
import AuthForm from './components/AuthForm';
import PasswordModal from './components/PasswordModal';
// ...existing code...

function App() {
  const [passwordError, setPasswordError] = useState('');
  const [user, setUser] = useState(null); // { username }
  const [tab, setTab] = useState('home');
  const isAdmin = user && user.username === 'admin@gmail.com';
  // ...existing code...
    // Handle file upload form submit (one by one)
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      setSubmitted(true);
      if (!files || files.length === 0) {
        setError('Please select at least one PDF file.');
        setLoading(false);
        setSubmitted(false);
        return;
      }
      let allSuccess = true;
      let errorFiles = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        try {
          const response = await fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: formData,
            credentials: 'include', // Ensure session cookie is sent
          });
          const data = await response.json();
          if (!response.ok) {
            allSuccess = false;
            errorFiles.push(files[i].name + ': ' + (data.error || 'Upload failed'));
          }
        } catch (err) {
          allSuccess = false;
          errorFiles.push(files[i].name + ': ' + err.message);
        }
      }
      if (allSuccess) {
        setShowExtractBtn(true);
        setError('');
        // Add to history only if not already present
        const now = new Date();
        setHistory(prev => {
          const existingNames = new Set(prev.map(h => h.name));
          const newEntries = Array.from(files)
            .filter(f => !existingNames.has(f.name))
            .map(f => ({
              name: f.name,
              pages: '-',
              addedAt: now.toLocaleString()
            }));
          return [...prev, ...newEntries];
        });
      } else {
        setError('Some files failed to upload:\n' + errorFiles.join('\n'));
      }
      setLoading(false);
    };

    // Check if PDF is password protected before extraction
    const checkProtectedAndExtract = async () => {
      setError('');
      setLoading(true);
      setShowExtractBtn(false);
      if (!files || files.length === 0) {
        setError('No files to extract.');
        setLoading(false);
        return;
      }
      try {
        const results = [];
        for (let i = 0; i < files.length; i++) {
          const checkRes = await fetch('http://localhost:5000/check_protected', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: files[i].name }),
          });
          const checkData = await checkRes.json();
          if (checkData.protected) {
            setShowPasswordModal(true);
            setPendingExtractFile(files[i]);
            setPasswordError('');
            setLoading(false);
            return;
          } else {
            // Not protected, extract directly
            const response = await fetch('http://localhost:5000/extract', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ filename: files[i].name }),
              credentials: 'include',
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Extraction failed');
            results.push({ summary: data.summary, text: data.text });
          }
        }
        setExtractedTexts(results);
        setError('');
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
  // (Removed duplicate user state)

  // Check user session on mount to persist login
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('http://localhost:5000/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.user) setUser({ username: data.user });
        }
      } catch (e) {
        // Not logged in or server error
      }
    }
    checkAuth();
  }, []);
  const [aiAnalysisResults, setAiAnalysisResults] = useState([]);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysisError, setAiAnalysisError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pdfPassword, setPdfPassword] = useState('');
  const [pendingExtractFile, setPendingExtractFile] = useState(null);
  const [showExtractBtn, setShowExtractBtn] = useState(false);
  // (Removed duplicate tab state)
  const [files, setFiles] = useState([]); // For multiple PDFs
  const [extractedTexts, setExtractedTexts] = useState([]); // Array of extracted texts
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false); // Track submit button state
  const [searchTerm, setSearchTerm] = useState('');

  // User-specific history from backend
  const [history, setHistory] = useState([]);

  // Fetch history from backend when user logs in or tab changes to history
  useEffect(() => {
    if (user && tab === 'history') {
      fetch('http://localhost:5000/history', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.history) setHistory(data.history);
          else setHistory([]);
        })
        .catch(() => setHistory([]));
    }
  }, [user, tab]);

  // Add to backend history after successful upload
  // (No-op here, handled by backend on upload)


  const handleLogout = async () => {
    await fetch('http://localhost:5000/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    setHistory([]);
  };


  // Reset upload page state when user changes (new login)
  useEffect(() => {
    setFiles([]);
    setExtractedTexts([]);
    setError('');
    setSubmitted(false);
    setShowExtractBtn(false);
  }, [user]);



  // ...existing code...

  // Show normal user login if not logged in
  if (!user) {
    return <AuthForm onAuth={u => {
      setUser({ username: typeof u === 'string' ? u : u.username });
      setTab('home');
    }} />;
  }

  const handleFileChange = (e) => {
    let selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 10) {
      setError('You can only upload up to 10 files at a time.');
      selectedFiles = selectedFiles.slice(0, 10);
    } else {
      setError('');
    }
    setFiles(selectedFiles);
    setExtractedTexts([]);
    setSubmitted(false);
  };


  // Handle password submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPasswordError('');
    if (!pendingExtractFile) return;
    try {
      const response = await fetch('http://localhost:5000/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: pendingExtractFile.name, password: pdfPassword }),
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401 && data.needs_password) {
          setPasswordError('Incorrect password. Please try again.');
          setLoading(false);
          return;
        }
        setShowPasswordModal(false);
        setExtractedTexts([{ summary: `Error: ${data.error || 'Failed to extract PDF'}`, text: `Error: ${data.error || 'Failed to extract PDF'}` }]);
        setLoading(false);
        setShowExtractBtn(false);
        setPdfPassword('');
        setPendingExtractFile(null);
        return;
      }
      setShowPasswordModal(false);
      setExtractedTexts([{ summary: data.summary, text: data.text }]);
      setShowExtractBtn(false);
      setPdfPassword('');
      setPendingExtractFile(null);
      setTab('upload');
    } catch (err) {
      setShowPasswordModal(false);
      setExtractedTexts([{ summary: `Error: ${err.message}`, text: `Error: ${err.message}` }]);
      setShowExtractBtn(false);
      setPdfPassword('');
      setPendingExtractFile(null);
    }
    setLoading(false);
  };

  // Handle tab change and reset states
  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSubmitted(false);
    setShowExtractBtn(false);
    if (newTab === 'home') {
      setFiles([]);
      setExtractedTexts([]);
      setError('');
    }
  };


  // Scan Again handler for HistoryPanel (with password check)
  async function handleScanAgain(fileName) {
    setLoading(true);
    setError("");
    try {
      // Check if PDF is password protected
      const checkRes = await fetch('http://localhost:5000/check_protected', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: fileName }),
      });
      const checkData = await checkRes.json();
      if (checkData.protected) {
        setShowPasswordModal(true);
        setPendingExtractFile({ name: fileName });
        setPasswordError('');
        setLoading(false);
        return;
      } else {
        // Not protected, extract directly
        const response = await fetch('http://localhost:5000/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: fileName }),
          credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to extract PDF');
        }
        setExtractedTexts([{ summary: data.summary, text: data.text }]);
        setTab('upload');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
    setLoading(false);
  }

  // ...existing code...

  return (
    <div className="App">
      <Navbar
        tab={tab}
        onTabChange={handleTabChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        user={user}
        onLogout={handleLogout}
        showAdminTab={isAdmin}
      />
      <main className="main-window">
        {isAdmin && tab === 'admin' ? (
          <AdminDashboard />
        ) : (
          <>
            {tab === 'upload' && (
              <>
                <UploadPanel
                  files={files}
                  onFileChange={handleFileChange}
                  onSubmit={handleSubmit}
                  loading={loading}
                  submitted={submitted}
                  error={error}
                  showExtractBtn={showExtractBtn}
                  onExtract={checkProtectedAndExtract}
                />
                <ExtractedTextPanel
                  extractedTexts={extractedTexts}
                  files={files}
                  searchTerm={searchTerm}
                />
                <AIAnalysisPanel
                  aiAnalysisResults={aiAnalysisResults}
                  loading={aiAnalysisLoading}
                  error={aiAnalysisError}
                />
              </>
            )}
            {tab === 'history' && <HistoryPanel history={history} onClear={async () => {
              await fetch('http://localhost:5000/history/clear', { method: 'POST', credentials: 'include' });
              setHistory([]);
            }} onScanAgain={handleScanAgain} />}
            {tab === 'about' && <AboutPanel />}

            {tab === 'home' && (
              <div className="home-hero gradient-bg" style={{width: '100vw', minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 0 3rem 0'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '2.5rem', margin: '3rem 0 2rem 0', justifyContent: 'center'}}>
                  <img src={require('./image.webp')} alt="Books" style={{width: '180px', height: '180px', borderRadius: '32px', objectFit: 'cover', boxShadow: '0 4px 24px rgba(0,0,0,0.13)'}} />
                  <div>
                    <h1 style={{fontFamily: 'Montserrat, sans-serif', fontSize: '2.7rem', fontWeight: 900, color: '#1976d2', margin: 0, letterSpacing: '1px'}}>PDF Reader AI</h1>
                    <p style={{fontFamily: 'Montserrat, sans-serif', fontSize: '1.25rem', color: '#333', margin: '0.5rem 0 0 0'}}>Extract, analyze, and manage your PDFs with AI-powered productivity tools.</p>
                    <div style={{marginTop: '1.5rem', display: 'flex', gap: '1.2rem'}}>
                      <button onClick={() => setTab('upload')} style={{background: 'linear-gradient(90deg,#a8edea,#fed6e3)', border: 'none', borderRadius: 12, padding: '0.9rem 2.2rem', fontWeight: 700, fontSize: '1.1rem', color: '#1976d2', cursor: 'pointer', boxShadow: '0 2px 8px #a8edea55'}}>Upload PDF</button>
                      <button onClick={() => setTab('history')} style={{background: 'linear-gradient(90deg,#fcb69f,#ffecd2)', border: 'none', borderRadius: 12, padding: '0.9rem 2.2rem', fontWeight: 700, fontSize: '1.1rem', color: '#b76e79', cursor: 'pointer', boxShadow: '0 2px 8px #fcb69f55'}}>View History</button>
                      <button onClick={() => setTab('about')} style={{background: 'linear-gradient(90deg,#cfd9df,#e2ebf0)', border: 'none', borderRadius: 12, padding: '0.9rem 2.2rem', fontWeight: 700, fontSize: '1.1rem', color: '#1976d2', cursor: 'pointer', boxShadow: '0 2px 8px #cfd9df55'}}>About</button>
                    </div>
                  </div>
                </div>
                <div className="home-features" style={{margin: '2.5rem 0 2rem 0', width: '100%', maxWidth: 800, textAlign: 'left'}}>
                  <h2 style={{fontFamily: 'Montserrat, sans-serif', fontWeight: 800, color: '#1976d2', marginBottom: 18, textAlign: 'left'}}>Features</h2>
                  <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '1.08rem', textAlign: 'left'}}>
                    <li style={{marginBottom: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.7rem'}}><span style={{fontSize: '1.5em'}}>📤</span> Batch upload up to 10 PDFs at once</li>
                    <li style={{marginBottom: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.7rem'}}><span style={{fontSize: '1.5em'}}>🤖</span> AI-powered text extraction & smart summaries</li>
                    <li style={{marginBottom: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.7rem'}}><span style={{fontSize: '1.5em'}}>🔍</span> Full-text search and keyword highlighting</li>
                    <li style={{marginBottom: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.7rem'}}><span style={{fontSize: '1.5em'}}>🕑</span> Timeline history with scan again & clear options</li>
                    <li style={{marginBottom: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.7rem'}}><span style={{fontSize: '1.5em'}}>💬</span> Built-in AI Chatbot for instant help</li>
                    <li style={{marginBottom: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.7rem'}}><span style={{fontSize: '1.5em'}}>🎨</span> Modern glassmorphism UI with gradients & custom fonts</li>
                  </ul>
                </div>
                <blockquote style={{fontStyle: 'italic', color: '#555', margin: '20px 0', fontSize: '1.15rem', maxWidth: 600, textAlign: 'center', background: 'rgba(255,255,255,0.18)', borderRadius: 12, padding: '1.2rem 2rem', boxShadow: '0 2px 8px #a8edea33'}}>
                  “A room without books is like a body without a soul.”<br /><span style={{fontSize: '1rem', color: '#888'}}>— Marcus Tullius Cicero</span>
                </blockquote>
              </div>
            )}
            {/* Password Modal */}
            {showPasswordModal && (
              <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999}}>
                <form onSubmit={handlePasswordSubmit} style={{background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'}}>
                  <h3>Enter PDF Password</h3>
                  <input
                    type="password"
                    value={pdfPassword}
                    onChange={e => setPdfPassword(e.target.value)}
                    placeholder="PDF Password"
                    style={{marginBottom: '1rem', padding: '8px', width: '100%'}}
                    required
                  />
                  {passwordError && <div style={{color: 'red', marginBottom: '1rem'}}>{passwordError}</div>}
                  <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <button type="submit" className="submit-btn" style={{minWidth: '100px', padding: '8px 0'}}>Submit</button>
                    <button type="button" className="submit-btn" style={{marginLeft: '1rem', minWidth: '100px', padding: '8px 0'}} onClick={() => { setShowPasswordModal(false); setPasswordError(''); }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </main>

      <Chatbot />
      <footer className="App-footer">
        <span>Made with ❤️ for Hackathon | &copy; {new Date().getFullYear()} PDF Reader</span>
      </footer>
    </div>
  );
}

export default App;