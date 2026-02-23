

import React, { useRef, useState } from 'react';

const heroImg = 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80';

const UploadPanel = ({ files, onFileChange, onSubmit, loading, submitted, error, showExtractBtn, onExtract }) => {
  const fileInputRef = useRef();
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      fileInputRef.current.files = e.dataTransfer.files;
      onFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  // Preview thumbnails for PDFs (first page as icon)
  const renderFilePreview = (file) => {
    return (
      <div className="upload-file-preview" key={file.name}>
        <span className="upload-file-thumbnail">📄</span>
        <span className="upload-file-name">{file.name}</span>
        <span className="upload-file-size">{(file.size/1024).toFixed(1)} KB</span>
        <button
          className="remove-file-btn"
          title="Remove"
          onClick={e => { e.stopPropagation(); fileInputRef.current.value = ''; onFileChange({ target: { files: Array.from(files).filter(f => f.name !== file.name) } }); }}
        >✖</button>
      </div>
    );
  };

  // Calculate total size
  const totalSize = files && files.length > 0 ? Array.from(files).reduce((acc, f) => acc + f.size, 0) : 0;

  return (
    <div className="upload-fullpage business-card" style={{maxWidth: 600, margin: '2.5rem auto', padding: '2.5rem 2rem'}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24}}>
        <div style={{background: 'linear-gradient(135deg,#1976d2,#43a7fd)', borderRadius: '50%', width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: '0 2px 8px #1976d255'}}>
          <span style={{fontSize: 38, color: '#fff'}}>📤</span>
        </div>
        <h2 style={{fontWeight: 800, fontSize: '2rem', color: '#1a2233', margin: 0}}>Upload PDF Files</h2>
        <p style={{color: '#3a4664', fontSize: '1.08rem', margin: '8px 0 0 0'}}>Drag & drop, or click to select up to 10 PDFs.</p>
      </div>
      <form onSubmit={onSubmit} autoComplete="off">
                {/* PDF Password input */}
                  {/* Removed PDF Password input */}
        <div
          className={`upload-dropzone unique-dropzone${dragActive ? ' drag-active' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current.click()}
          style={{
            border: '2.5px dashed #1976d2',
            borderRadius: 16,
            background: dragActive ? '#e3f0fc' : '#f7fafd',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: 18,
            transition: 'border-color 0.2s, background 0.2s',
            position: 'relative',
          }}
        >
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={onFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          <div style={{fontSize: '1.15rem', color: '#1976d2', fontWeight: 600, marginBottom: 6}}>
            Drag & drop PDF files here
          </div>
          <div style={{color: '#888', fontSize: '1rem', marginBottom: 0}}>
            or <span style={{color: '#1976d2', textDecoration: 'underline'}}>browse</span> from your computer
          </div>
          {files && files.length > 0 && (
            <div className="upload-file-list" style={{marginTop: 18}}>
              {Array.from(files).map((file) => renderFilePreview(file))}
            </div>
          )}
          {loading && (
            <div className="upload-progress-bar">
              <div className="upload-progress" style={{ width: '80%' }}></div>
            </div>
          )}
        </div>
        {files && files.length > 0 && (
          <div className="upload-summary-row" style={{marginBottom: 10, color: '#1976d2', fontWeight: 600}}>
            <span><strong>{files.length}</strong> file(s) selected</span>
            <span>Total size: <strong>{(totalSize/1024).toFixed(1)} KB</strong></span>
          </div>
        )}
        <div className="upload-btn-row" style={{marginTop: 18, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap'}}>
          <button
            type="submit"
            disabled={loading}
            className={submitted ? 'modern-upload-btn' : 'modern-upload-btn'}
            style={{
              minWidth: 140,
              fontWeight: 700,
              fontSize: '1.08em',
              background: loading ? '#b6c7e3' : 'linear-gradient(90deg,#1976d2,#43a7fd)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              boxShadow: '0 2px 8px #1976d255',
              padding: '12px 0',
              letterSpacing: 0.5,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s, box-shadow 0.2s',
              outline: 'none',
              marginRight: 12
            }}
            onMouseOver={e => { if (!loading) e.target.style.background = 'linear-gradient(90deg,#125ea2,#1976d2)'; }}
            onMouseOut={e => { if (!loading) e.target.style.background = 'linear-gradient(90deg,#1976d2,#43a7fd)'; }}
          >
            {loading ? 'Uploading...' : submitted ? 'Uploaded' : <><span style={{fontSize:'1.25em',marginRight:8}}>⬆️</span>Upload</>}
          </button>
          {showExtractBtn && (
            <button className="extract-btn" onClick={onExtract} disabled={loading} type="button" style={{minWidth: 140, fontWeight: 700, fontSize: '1.08em'}}>
              {loading ? 'Extracting...' : 'Extract PDF Text'}
            </button>
          )}
        </div>
        {error && <div className="error" style={{marginTop: 12}}>{error}</div>}
      </form>
      <div className="upload-tips" style={{marginTop: 24, background: '#e3f0fc', color: '#1976d2', fontWeight: 500, borderRadius: 8, padding: '0.7rem 1rem', boxShadow: '0 1px 4px rgba(25,118,210,0.04)'}}>
        <span>✨ Tip: You can upload multiple PDFs at once for batch extraction!</span>
      </div>
    </div>
  );
};

export default UploadPanel;
