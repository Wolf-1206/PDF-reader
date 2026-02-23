import React from 'react';
import './AIAnalysisPanel.css';

export default function AIAnalysisPanel({ aiAnalysisResults, loading, error }) {
  return (
    <div className="ai-analysis-panel glass-card">
      <h3>AI Analysis</h3>
      {loading && <div className="ai-analysis-loading">Analyzing with AI...</div>}
      {error && <div className="ai-analysis-error">{error}</div>}
      {aiAnalysisResults && aiAnalysisResults.length > 0 ? (
        <ul className="ai-analysis-list">
          {aiAnalysisResults.map((result, idx) => (
            <li key={idx} className="ai-analysis-item">
              <strong>File:</strong> {result.fileName}<br />
              <strong>Summary:</strong> {result.summary}<br />
              {result.keywords && (
                <><strong>Keywords:</strong> {result.keywords.join(', ')}</>
              )}
            </li>
          ))}
        </ul>
      ) : (
        !loading && <div className="ai-analysis-empty">No AI analysis yet.</div>
      )}
    </div>
  );
}
