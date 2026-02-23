
import React, { useState } from 'react';

// Accepts array of objects: { summary, text, ... }
const ExtractedTextPanel = ({ extractedTexts, files, searchTerm }) => {
  const [activeTab, setActiveTab] = useState('summary'); // summary | text | csv

  // Highlight search term in text
  const getHighlightedText = (txt, highlight) => {
    if (!highlight) return txt;
    const parts = txt.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={i} style={{ backgroundColor: 'yellow' }}>{part}</span>
      ) : (
        part
      )
    );
  };

  // Convert extractedTexts to CSV string
  const getCSV = () => {
    const header = 'File Name,Summary,Text';
    const rows = extractedTexts.map((item, idx) => {
      const summary = typeof item === 'object' && item !== null ? item.summary : item;
      const text = typeof item === 'object' && item !== null ? item.text : item;
      const fileName = files[idx]?.name || `PDF ${idx + 1}`;
      // Escape quotes and commas
      const esc = (str) => '"' + String(str).replace(/"/g, '""').replace(/\n/g, ' ') + '"';
      return [esc(fileName), esc(summary), esc(text)].join(',');
    });
    return [header, ...rows].join('\n');
  };

  const handleDownload = (content, filename, type = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };



  return (
  <div className="extracted-text glassmorphism" style={{margin: '32px 0', width: '100%', maxWidth: '100vw', padding: '40px 5vw', borderRadius: 24, boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)'}}>
      <h3 style={{fontWeight: 700, fontSize: '1.5rem', marginBottom: 18, color: '#2d2d2d', display: 'flex', alignItems: 'center'}}>
        <span style={{marginRight: 10, fontSize: '1.6em'}}>📄</span> Extracted Results
      </h3>
      <div style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
        <button
          className={activeTab === 'summary' ? 'active-tab' : ''}
          onClick={() => setActiveTab('summary')}
          style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: activeTab === 'summary' ? 'linear-gradient(90deg,#a8edea,#fed6e3)' : '#f7f7f7', fontWeight: 600, cursor: 'pointer', boxShadow: activeTab === 'summary' ? '0 2px 8px #a8edea55' : 'none' }}
        >Summary</button>
        <button
          className={activeTab === 'text' ? 'active-tab' : ''}
          onClick={() => setActiveTab('text')}
          style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: activeTab === 'text' ? 'linear-gradient(90deg,#fcb69f,#ffecd2)' : '#f7f7f7', fontWeight: 600, cursor: 'pointer', boxShadow: activeTab === 'text' ? '0 2px 8px #fcb69f55' : 'none' }}
        >Plain Text</button>
        <button
          className={activeTab === 'csv' ? 'active-tab' : ''}
          onClick={() => setActiveTab('csv')}
          style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: activeTab === 'csv' ? 'linear-gradient(90deg,#cfd9df,#e2ebf0)' : '#f7f7f7', fontWeight: 600, cursor: 'pointer', boxShadow: activeTab === 'csv' ? '0 2px 8px #cfd9df55' : 'none' }}
        >CSV</button>
      </div>

      {activeTab === 'csv' ? (
        <div style={{ marginBottom: 16 }}>
          <button style={{background: 'linear-gradient(90deg,#cfd9df,#e2ebf0)', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px #cfd9df55'}} onClick={() => handleDownload(getCSV(), 'extracted_results.csv', 'text/csv')}>Download CSV</button>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f7f7f7', borderRadius: 8, padding: 12, marginTop: 12, fontSize: '1em', color: '#333', fontFamily: 'Menlo, monospace' }}>{getCSV()}</pre>
        </div>
      ) : (
        extractedTexts.map((item, idx) => {
          const summary = typeof item === 'object' && item !== null ? item.summary : item;
          const fullText = typeof item === 'object' && item !== null ? item.text : item;
          const fileName = files[idx]?.name?.replace(/\.pdf$/i, '') || `PDF_${idx + 1}`;
          let displayText = activeTab === 'summary'
            ? (summary && typeof summary === 'string' && summary.trim().length > 0 ? summary : fullText)
            : fullText;
          if (typeof displayText !== 'string') displayText = displayText ? String(displayText) : '';
          return (
            <div key={idx} className="extracted-result-card" style={{marginBottom: '28px', border: 'none', background: 'rgba(255,255,255,0.32)', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.10)', padding: '20px 24px', position: 'relative'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 12}}>
                <span style={{fontWeight: 700, fontSize: '1.1em', color: '#2d2d2d', display: 'flex', alignItems: 'center'}}>
                  <span style={{marginRight: 8, fontSize: '1.3em'}}>📑</span>{fileName}
                </span>
                <div style={{display: 'flex', gap: 10}}>
                  <button
                    className="extract-btn"
                    style={{background: 'linear-gradient(90deg,#a8edea,#fed6e3)', border: 'none', borderRadius: 8, padding: '6px 16px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px #a8edea55', display: 'flex', alignItems: 'center'}}
                    onClick={() => handleDownload(displayText, `${fileName}_${activeTab}.txt`)}
                    title="Download"
                  >
                    <span style={{marginRight: 6}}>⬇️</span> Download
                  </button>
                </div>
              </div>
              <pre style={{whiteSpace: 'pre-wrap', fontSize: '1.08em', color: '#222', background: 'rgba(255,255,255,0.18)', borderRadius: 8, padding: 14, margin: 0, fontFamily: 'Menlo, monospace'}}>{getHighlightedText(displayText, searchTerm)}</pre>
              <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 10, gap: 12}}>
                <span style={{fontSize: '0.95em', color: '#888'}}>Words: {typeof displayText === 'string' ? displayText.split(/\s+/).length : 0}</span>
                <span style={{fontSize: '0.95em', color: '#888'}}>Chars: {typeof displayText === 'string' ? displayText.length : 0}</span>
              </div>
              <details style={{marginTop: '10px', fontSize: '0.93em', color: '#555'}}>
                <summary style={{cursor: 'pointer'}}>Show raw backend response</summary>
                <pre style={{whiteSpace: 'pre-wrap', background: '#f7f7f7', borderRadius: '8px', padding: '10px', fontSize: '0.97em', color: '#444'}}>{JSON.stringify(item, null, 2)}</pre>
              </details>
            </div>
          );
        })
      )}
  </div>
  );
};

export default ExtractedTextPanel;
