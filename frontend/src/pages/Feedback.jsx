import React, { useState } from 'react';
import { ShieldCheck, Send, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

const Feedback = () => {
  const [category, setCategory] = useState('Academics');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const CHARACTER_LIMIT = 500;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setStatus('');

    const formattedFeedback = `[Category: ${category}] ${message.trim()}`;

    try {
      const res = await fetch('http://localhost:8000/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: formattedFeedback }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        setStatus(data.message);
        setMessage('');
      } else {
        setStatus('Submission failed. Please check backend connection.');
      }
    } catch (err) {
      console.error(err);
      setStatus('Connection error. Is the backend running on port 8000?');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setStatus('');
    setMessage('');
    setCategory('Academics');
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <header className="page-header">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.2rem' }}>Anonymous Feedback</h1>
        <p style={{ color: 'var(--text-muted)' }}>Help improve campus life, curriculum structure, or campus services. Your submission is 100% private.</p>
      </header>

      <div className="grid-cols-2" style={{ alignItems: 'start' }}>
        {/* Form Container */}
        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
          {success ? (
            /* Success View */
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(20, 184, 166, 0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-teal)' }}>
                <CheckCircle size={32} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Feedback Submitted</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Your comments have been logged in the secure repository file. Administrators can review suggestions without seeing names, user IDs, or IPs.
                </p>
              </div>
              <button className="btn btn-secondary" onClick={handleReset} style={{ marginTop: '0.5rem' }}>
                <RefreshCw size={16} />
                <span>Submit More Feedback</span>
              </button>
            </div>
          ) : (
            /* Active Form View */
            <>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>Compose Suggestion</h2>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Category Selection */}
                <div>
                  <label htmlFor="category" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    Feedback Category
                  </label>
                  <select 
                    id="category"
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="Academics">Academics & Syllabus</option>
                    <option value="Facilities">Campus Facilities & Infrastructure</option>
                    <option value="Faculty">Faculty & Course Delivery</option>
                    <option value="Administration">Office of Administration</option>
                    <option value="Others">General Suggestion</option>
                  </select>
                </div>

                {/* Feedback Message */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label htmlFor="message" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Your Message
                    </label>
                    <span style={{ fontSize: '0.85rem', color: message.length > CHARACTER_LIMIT - 50 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                      {message.length} / {CHARACTER_LIMIT}
                    </span>
                  </div>
                  <textarea 
                    id="message"
                    value={message} 
                    onChange={(e) => setMessage(e.target.value.slice(0, CHARACTER_LIMIT))} 
                    placeholder="Describe your issue, suggestions, or concerns. Focus on constructive feedback..."
                    disabled={isSubmitting}
                    maxLength={CHARACTER_LIMIT}
                    required
                  />
                </div>

                {/* Status messages */}
                {status && !success && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    padding: '0.9rem 1.1rem', 
                    borderRadius: 'var(--border-radius-md)', 
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: 'var(--accent-rose)',
                    fontSize: '0.9rem'
                  }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{status}</span>
                  </div>
                )}

                {/* Action button */}
                <button 
                  type="submit" 
                  className="btn" 
                  disabled={isSubmitting || !message.trim()}
                  style={{ background: 'var(--accent-rose-gradient)', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)', alignSelf: 'flex-start' }}
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Anonymously'}</span>
                </button>
              </form>
            </>
          )}
        </div>

        {/* Informational Security Card */}
        <div className="glass-card accent-rose">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
            <ShieldCheck size={28} style={{ color: 'var(--accent-rose)' }} />
            <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Privacy Assurance</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            <p>
              The Smart Academic Companion is engineered with privacy as a foundational design element. Here is how we guarantee anonymity:
            </p>
            <ul style={{ listStyleType: 'disc', marginLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <strong>No Identity Tracking:</strong> We do not ask for login tokens or student numbers to access this module.
              </li>
              <li>
                <strong>Metadata Stripping:</strong> IP addresses and timestamps are completely excluded from database write entries.
              </li>
              <li>
                <strong>Appended Logs:</strong> Submissions are stored sequentially inside a raw file (<code>feedback.txt</code>) to avoid relational correlation.
              </li>
            </ul>
            <p style={{ marginTop: '0.5rem', fontStyle: 'italic', fontSize: '0.85rem', borderLeft: '2px solid var(--accent-rose)', paddingLeft: '0.75rem' }}>
              "Constructive feedback drives growth. Speak your mind freely; we handle the transmission securely."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
