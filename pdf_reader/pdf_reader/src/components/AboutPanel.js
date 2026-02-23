
import React from 'react';

const heroImg = 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80';




const AboutPanel = () => (
  <div className="about-fullpage" style={{ maxWidth: 1100, margin: '2.5rem auto', padding: '2.5rem 2rem', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(31,38,135,0.08)', border: '1.5px solid #e3e8f0' }}>
    <div style={{ display: 'flex', alignItems: 'stretch', gap: '2.5rem', flexWrap: 'wrap', marginBottom: 32 }}>
      <section style={{ minWidth: 280, maxWidth: 370, flex: '0 0 340px', background: 'linear-gradient(135deg,#e3f0fc,#f7fafd)', borderRadius: 18, padding: '2.2rem 1.7rem', boxShadow: '0 2px 12px #1976d233', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '1.5px solid #e3e8f0' }}>
        <h2 style={{ color: '#1976d2', fontWeight: 900, fontSize: '1.45rem', marginBottom: 18, letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'left' }}>Why Choose PDF Reader?</h2>
        <ul style={{ listStyle: 'none', padding: 0, color: '#1a2233', fontSize: '1.09rem', margin: 0, lineHeight: 1.85, fontWeight: 500 }}>
          <li style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}><span style={{fontSize:'1.5em',marginRight:10}}>📄</span>Batch PDF Upload & Processing</li>
          <li style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}><span style={{fontSize:'1.5em',marginRight:10}}>🤖</span>AI-Powered Extraction & Summaries</li>
          <li style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}><span style={{fontSize:'1.5em',marginRight:10}}>🔍</span>Instant Search & Highlight</li>
          <li style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}><span style={{fontSize:'1.5em',marginRight:10}}>📊</span>Export as Text or CSV</li>
          <li style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}><span style={{fontSize:'1.5em',marginRight:10}}>🕒</span>Timeline History & Re-Scan</li>
          <li style={{ display: 'flex', alignItems: 'center', marginBottom: 0 }}><span style={{fontSize:'1.5em',marginRight:10}}>💬</span>Built-in AI Chatbot Support</li>
        </ul>
      </section>
      <div style={{ flex: 1, minWidth: 320, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
        <h1 style={{ fontWeight: 900, fontSize: '2.5rem', color: '#1976d2', margin: 0, letterSpacing: 1, textAlign: 'left', lineHeight: 1.1 }}>Business-Ready PDF Intelligence</h1>
        <p style={{ color: '#3a4664', fontSize: '1.18rem', margin: '18px 0 0 0', fontWeight: 500, maxWidth: 600, textAlign: 'left' }}>
          Unlock the full potential of your documents with a secure, AI-driven platform designed for professionals. Extract, summarize, search, and manage PDFs with speed and confidence.
        </p>
        <img src={heroImg} alt="About Hero" className="about-hero-img" style={{ width: '100%', maxWidth: 340, borderRadius: 18, margin: '32px 0 0 0', boxShadow: '0 2px 12px #1976d233' }} />
      </div>
    </div>
    <section className="about-team" style={{ margin: '2.5rem 0 1.5rem 0' }}>
      <h2 style={{ color: '#1976d2', fontWeight: 800, fontSize: '1.25rem', marginBottom: 18 }}>Meet the Team</h2>
      <div className="about-team-list" style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <div className="about-team-member" style={{ background: '#f7fafd', borderRadius: 12, padding: '1.2rem 2rem', boxShadow: '0 2px 8px #1976d211', minWidth: 180, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span role="img" aria-label="dev" style={{ fontSize: 32 }}>👨‍💻</span>
          <div><strong>Nishant Chaudhary</strong><br />Lead Developer</div>
        </div>
        <div className="about-team-member" style={{ background: '#f7fafd', borderRadius: 12, padding: '1.2rem 2rem', boxShadow: '0 2px 8px #1976d211', minWidth: 180, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span role="img" aria-label="ai" style={{ fontSize: 32 }}>🤖</span>
          <div><strong>GitHub Copilot</strong><br />AI Assistant</div>
        </div>
      </div>
    </section>
    <section className="about-cta" style={{ marginTop: 32, textAlign: 'center' }}>
      <h2 style={{ color: '#1976d2', fontWeight: 800, fontSize: '1.25rem', marginBottom: 10 }}>Ready to get started?</h2>
      <p style={{ color: '#3a4664', fontSize: '1.13rem', fontWeight: 500 }}>Upload your PDFs and experience the next generation of document intelligence!</p>
    </section>
  </div>
);

export default AboutPanel;
