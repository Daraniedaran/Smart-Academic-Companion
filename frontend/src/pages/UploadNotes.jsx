import React, { useState, useEffect } from 'react';
import { FileUp, FileText, CheckCircle, AlertCircle, Loader, HelpCircle, Search, Send, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { API_BASE_URL } from '../config';


const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + ['Bytes', 'KB', 'MB', 'GB'][i];
};

const UploadNotes = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedNotes, setUploadedNotes] = useState([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  
  // Notes Search/Q&A States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAnswer, setSearchAnswer] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');


  const fetchNotes = async () => {
    try {
      const data = await api.getNotes();
      setUploadedNotes(data.notes || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
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

    try {
      const res = await api.uploadFile(file);
      const data = await res.json();
      if (res.ok) {
        setMessageType('success');
        setMessage(data.message);
        setFile(null);
        fetchNotes();
      } else {
        setMessageType('error');
        setMessage(data.detail || 'Upload failed.');
      }
    } catch (err) {
      setMessageType('error');
      setMessage(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');
    setSearchAnswer('');

    try {
      const res = await api.queryNotes(searchQuery);
      setSearchAnswer(res.answer);
    } catch (err) {
      console.error('Error querying notes:', err);
      setSearchError(err.message || 'Failed to query notes. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const renderMessageContent = (text) => {
    if (!text) return null;
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match ? match[1] : '';
        const code = match ? match[2] : part.slice(3, -3);
        return (
          <pre key={index} style={{
            background: 'rgba(0,0,0,0.15)',
            padding: '1rem',
            borderRadius: 'var(--border-radius-md)',
            overflowX: 'auto',
            margin: '0.75rem 0',
            border: '1px solid var(--border-color)',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>
              {language || 'code'}
            </div>
            <code style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-main)' }}>{code.trim()}</code>
          </pre>
        );
      }
      const lines = part.split('\n');
      return lines.map((line, lIdx) => {
        let content = line;
        if (content.startsWith('### ')) {
          return <h3 key={`${index}-${lIdx}`} style={{ marginTop: '0.75rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-main)', textAlign: 'left' }}>{content.replace('### ', '')}</h3>;
        }
        if (content.startsWith('## ')) {
          return <h2 key={`${index}-${lIdx}`} style={{ marginTop: '0.75rem', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--text-main)', textAlign: 'left' }}>{content.replace('## ', '')}</h2>;
        }
        if (content.startsWith('# ')) {
          return <h1 key={`${index}-${lIdx}`} style={{ marginTop: '0.75rem', marginBottom: '0.5rem', fontWeight: 800, color: 'var(--text-main)', textAlign: 'left' }}>{content.replace('# ', '')}</h1>;
        }
        const isBullet = content.trim().startsWith('- ') || content.trim().startsWith('* ');
        if (isBullet) {
          content = content.trim().replace(/^[-*]\s+/, '');
        }
        const tokens = content.split(/(\*\*.*?\*\*|`.*?`)/g);
        const parsedTokens = tokens.map((token, tIdx) => {
          if (token.startsWith('**') && token.endsWith('**')) {
            return <strong key={tIdx} style={{ fontWeight: 700 }}>{token.slice(2, -2)}</strong>;
          }
          if (token.startsWith('`') && token.endsWith('`')) {
            return <code key={tIdx} style={{ background: 'rgba(0,0,0,0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85em' }}>{token.slice(1, -1)}</code>;
          }
          return token;
        });
        if (isBullet) {
          return (
            <li key={`${index}-${lIdx}`} style={{ marginLeft: '1.25rem', marginBottom: '0.25rem', listStyleType: 'disc', color: 'var(--text-main)', textAlign: 'left' }}>
              {parsedTokens}
            </li>
          );
        }
        return content.trim() ? <p key={`${index}-${lIdx}`} style={{ marginBottom: '0.5rem', color: 'var(--text-main)', textAlign: 'left' }}>{parsedTokens}</p> : <div key={`${index}-${lIdx}`} style={{ height: '0.5rem' }}></div>;
      });
    });
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
                    <Loader size={18} className="animate-spin" style={{ animationDuration: '1s' }} />
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
              <Loader size={32} className="animate-spin" style={{ color: 'var(--accent-teal)' }} />
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
                <div key={idx} className="file-item" style={{ transition: 'all var(--transition-fast)' }}>
                  <div 
                    className="file-info" 
                    style={{ cursor: 'pointer', flex: 1 }} 
                    onClick={() => window.open(`${API_BASE_URL}/notes/${encodeURIComponent(note.name)}`, '_blank')}
                    title="Click to view file"
                  >
                    <FileText className="file-icon" size={20} />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ 
                        fontWeight: 500, 
                        fontSize: '0.95rem', 
                        color: 'var(--text-main)', 
                        wordBreak: 'break-all'
                      }}>
                        <span style={{ borderBottom: '1px dashed transparent', transition: 'border-bottom-color var(--transition-fast)' }} onMouseOver={(e) => e.currentTarget.style.borderBottomColor = 'var(--text-main)'} onMouseOut={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}>
                          {note.name}
                        </span>
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatBytes(note.size)}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', minHeight: 'auto', height: 'auto', boxShadow: 'none' }}
                      onClick={() => window.open(`${API_BASE_URL}/notes/${encodeURIComponent(note.name)}`, '_blank')}
                    >
                      Open
                    </button>
                    <span className="badge badge-green">Uploaded</span>
                  </div>
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

      {/* Search & Q&A Card */}
      <div className="glass-card accent-purple" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'rgba(168, 85, 247, 0.1)',
            color: 'var(--accent-purple)',
            padding: '0.6rem',
            borderRadius: 'var(--border-radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={22} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Ask AI About Your Notes</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>Type any question to search and get answers directly from all your uploaded notes.</p>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="e.g., What are the main concepts discussed in my lecture notes?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSearching}
              style={{
                width: '100%',
                padding: '0.9rem 1rem 0.9rem 2.75rem',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--border-color)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all var(--transition-fast)'
              }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-purple"
            disabled={isSearching || !searchQuery.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '110px', justifyContent: 'center' }}
          >
            {isSearching ? (
              <>
                <Loader size={18} className="animate-spin" style={{ animationDuration: '1s' }} />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Ask AI</span>
              </>
            )}
          </button>
        </form>

        {/* Search Error */}
        {searchError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.9rem 1.1rem',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '0.9rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--accent-rose)',
            textAlign: 'left'
          }}>
            <AlertCircle size={18} />
            <span>{searchError}</span>
          </div>
        )}

        {/* Search Result / Answer Box */}
        {searchAnswer && (
          <div style={{
            padding: '1.25rem',
            borderRadius: 'var(--border-radius-md)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(168, 85, 247, 0.02))',
            border: '1px solid var(--border-color)',
            borderLeft: '4px solid var(--accent-purple)',
            boxShadow: 'var(--shadow-sm)',
            maxHeight: '400px',
            overflowY: 'auto'
          }} className="animate-fadeIn">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left' }}>
              <Sparkles size={16} style={{ color: 'var(--accent-purple)' }} />
              AI Answer
            </h3>
            <div style={{
              fontSize: '0.95rem',
              lineHeight: '1.6',
              color: 'var(--text-main)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              textAlign: 'left'
            }}>
              {renderMessageContent(searchAnswer)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadNotes;
