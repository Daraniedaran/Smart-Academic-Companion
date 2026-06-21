import React, { useState, useEffect } from 'react';
import { FileUp, FileText, CheckCircle, AlertCircle, Loader, HelpCircle } from 'lucide-react';

const UploadNotes = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const [uploadedNotes, setUploadedNotes] = useState([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);

  // Fetch list of notes from backend
  const fetchNotes = async () => {
    try {
      const res = await fetch('http://localhost:8000/notes');
      if (res.ok) {
        const data = await res.json();
        setUploadedNotes(data.notes || []);
      }
    } catch (err) {
      console.error('Error fetching notes list:', err);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessageType('error');
      setMessage('Please select a file to upload first.');
      return;
    }

    setIsUploading(true);
    setMessage('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessageType('success');
        setMessage(data.message);
        setFile(null);
        // Refresh notes list
        fetchNotes();
      } else {
        setMessageType('error');
        setMessage(data.detail || 'Upload failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setMessageType('error');
      setMessage('Network error. Unable to upload file to backend.');
    } finally {
      setIsUploading(false);
    }
  };

  // Format bytes to KB/MB
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <header className="page-header">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.2rem' }}>Upload Study Notes</h1>
        <p style={{ color: 'var(--text-muted)' }}>Store notes, course syllabi, and study sheets securely. PDF and text files supported.</p>
      </header>

      <div className="grid-cols-2">
        {/* Upload Form Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>Add New Note</h2>
          
          <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Drag & Drop Area */}
            <div 
              className={`drag-drop-zone ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              <div className="drag-drop-icon">
                <FileUp size={32} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                  {file ? 'File selected!' : 'Drag and drop your file here'}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {file ? `${file.name} (${formatBytes(file.size)})` : 'or click to browse local files'}
                </p>
              </div>
              <input 
                id="file-input"
                type="file" 
                onChange={handleFileChange} 
                style={{ display: 'none' }}
                accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg"
              />
            </div>

            {/* Status alerts */}
            {message && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                padding: '0.9rem 1.1rem', 
                borderRadius: 'var(--border-radius-md)', 
                marginBottom: '1.25rem',
                fontSize: '0.9rem',
                background: messageType === 'success' ? 'rgba(20, 184, 166, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${messageType === 'success' ? 'rgba(20, 184, 166, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                color: messageType === 'success' ? 'var(--accent-teal)' : 'var(--accent-rose)'
              }}>
                {messageType === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                <span>{message}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
              {file && (
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setFile(null)} 
                  disabled={isUploading}
                  style={{ flex: 1 }}
                >
                  Clear Selection
                </button>
              )}
              <button 
                type="submit" 
                className="btn btn-teal" 
                disabled={isUploading || !file}
                style={{ flex: 2 }}
              >
                {isUploading ? (
                  <>
                    <Loader size={18} className="animate-pulse-slow" style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <FileUp size={18} />
                    <span>Upload Notes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Inventory list Card */}
        <div className="glass-card accent-teal" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>Your Academic Repository</h2>
          
          {isLoadingNotes ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '3rem 0', gap: '1rem', color: 'var(--text-muted)' }}>
              <Loader size={32} style={{ animation: 'spin 1.5s linear infinite', color: 'var(--accent-teal)' }} />
              <p>Fetching files...</p>
            </div>
          ) : uploadedNotes.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '3rem 0', gap: '0.75rem', textAlign: 'center' }}>
              <FileText size={48} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
              <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>No notes uploaded yet</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '250px' }}>
                Your uploaded files will appear here for easy reference and management.
              </p>
            </div>
          ) : (
            <div className="file-list" style={{ overflowY: 'auto', maxHeight: '380px', flex: 1 }}>
              {uploadedNotes.map((note, idx) => (
                <div key={idx} className="file-item">
                  <div className="file-info">
                    <FileText className="file-icon" size={20} />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontWeight: 500, fontSize: '0.95rem', color: 'var(--text-main)', wordBreak: 'break-all' }}>{note.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatBytes(note.size)}</p>
                    </div>
                  </div>
                  <span className="badge badge-green">Uploaded</span>
                </div>
              ))}
            </div>
          )}

          {/* Repository summary info */}
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '0.9rem 1.1rem', 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid var(--border-color)', 
            borderRadius: 'var(--border-radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)'
          }}>
            <HelpCircle size={18} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
            <span>Files are stored locally in the <code>uploads/</code> backend folder for offline study access.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadNotes;
