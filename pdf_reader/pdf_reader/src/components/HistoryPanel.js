
import React from 'react';



const HistoryPanel = ({ history, onClear, onScanAgain }) => (
  <div className="tab-content business-card">
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18}}>
      <h2 style={{fontWeight: 800, fontSize: '1.7rem', color: '#1a2233', margin: 0, textAlign: 'left'}}>Document History</h2>
      {history.length > 0 && (
        <button className="clear-history-btn" onClick={onClear} title="Clear History" style={{background: '#f44336', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 18px', fontWeight: 600, cursor: 'pointer'}}>🗑️ Clear</button>
      )}
    </div>
    {history.length === 0 ? (
      <div style={{ color: '#888', fontStyle: 'italic', marginTop: '2rem', textAlign: 'left' }}>No documents uploaded yet.</div>
    ) : (
      <div className="history-table-container" style={{overflowX: 'auto', width: '100%'}}>
        <table className="history-table" style={{width: '100%', minWidth: 600, tableLayout: 'fixed', borderCollapse: 'collapse'}}>
          <colgroup>
            <col style={{width: '36%'}} />
            <col style={{width: '12%'}} />
            <col style={{width: '32%'}} />
            <col style={{width: '20%'}} />
          </colgroup>
          <thead>
            <tr>
              <th style={{padding: '12px 16px', background: '#f4f7fa', fontWeight: 700, textAlign: 'left'}}>File Name</th>
              <th style={{padding: '12px 16px', background: '#f4f7fa', fontWeight: 700, textAlign: 'left'}}>Pages</th>
              <th style={{padding: '12px 16px', background: '#f4f7fa', fontWeight: 700, textAlign: 'left'}}>Uploaded At</th>
              <th style={{padding: '12px 16px', background: '#f4f7fa', fontWeight: 700, textAlign: 'left'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.map((doc, idx) => (
              <tr key={idx} style={{borderBottom: '1px solid #e3e8f0'}}>
                <td style={{padding: '12px 16px', wordBreak: 'break-all'}}>{doc.name}</td>
                <td style={{padding: '12px 16px'}}>{doc.pages !== undefined && doc.pages !== null && doc.pages !== '' ? doc.pages : '-'}</td>
                <td style={{padding: '12px 16px'}}>{doc.addedAt}</td>
                <td style={{padding: '12px 16px'}}>
                  <button className="scan-again-btn" onClick={() => onScanAgain(doc.name)} title="Scan Again" style={{background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 18px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'}}>🔄 Scan Again</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default HistoryPanel;