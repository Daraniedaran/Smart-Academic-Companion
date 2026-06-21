import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Sparkles, User, MessageSquare } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Chatbot = () => {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([
    {
      role: 'bot',
      content: 'Hello! I am your Smart Academic Companion. Ask me anything about your courses, research topics, resume writing, or exams!'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isLoading]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMsg = message.trim();
    setMessage('');
    
    // Add user message to history
    setHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(prev => [...prev, { role: 'bot', content: data.response }]);
      } else {
        setHistory(prev => [...prev, { role: 'bot', content: 'Sorry, I encountered an error communicating with the server.' }]);
      }
    } catch (err) {
      console.error(err);
      setHistory(prev => [...prev, { role: 'bot', content: `Connection error. Make sure the backend server is running and accessible at ${API_BASE_URL}.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChipClick = (prompt) => {
    setMessage(prompt);
  };

  const clearChat = () => {
    setHistory([
      {
        role: 'bot',
        content: 'Conversation reset. How can I help you with your studies now?'
      }
    ]);
  };

  // Custom simple parser to render basic markdown elements (bold, headers, bullet lists, code blocks)
  const renderMessageContent = (text) => {
    if (!text) return null;
    
    // Split message by code blocks
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        // It's a code block
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match ? match[1] : '';
        const code = match ? match[2] : part.slice(3, -3);
        return (
          <pre key={index}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>
              {language || 'code'}
            </div>
            <code>{code.trim()}</code>
          </pre>
        );
      }
      
      // Process inline elements line-by-line
      const lines = part.split('\n');
      return lines.map((line, lIdx) => {
        let content = line;
        
        // Headers
        if (content.startsWith('### ')) {
          return <h3 key={`${index}-${lIdx}`} style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>{content.replace('### ', '')}</h3>;
        }
        if (content.startsWith('## ')) {
          return <h2 key={`${index}-${lIdx}`} style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>{content.replace('## ', '')}</h2>;
        }
        if (content.startsWith('# ')) {
          return <h1 key={`${index}-${lIdx}`} style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>{content.replace('# ', '')}</h1>;
        }
        
        // Bullet list item
        const isBullet = content.trim().startsWith('- ') || content.trim().startsWith('* ');
        if (isBullet) {
          content = content.trim().replace(/^[-*]\s+/, '');
        }
        
        // Split by bold (**bold**) and inline code (`code`)
        const tokens = content.split(/(\*\*.*?\*\*|`.*?`)/g);
        const parsedTokens = tokens.map((token, tIdx) => {
          if (token.startsWith('**') && token.endsWith('**')) {
            return <strong key={tIdx}>{token.slice(2, -2)}</strong>;
          }
          if (token.startsWith('`') && token.endsWith('`')) {
            return <code key={tIdx} style={{ background: 'rgba(0,0,0,0.25)', padding: '0.1rem 0.35rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85em' }}>{token.slice(1, -1)}</code>;
          }
          return token;
        });
        
        if (isBullet) {
          return (
            <li key={`${index}-${lIdx}`} style={{ marginLeft: '1.25rem', marginBottom: '0.25rem', listStyleType: 'disc' }}>
              {parsedTokens}
            </li>
          );
        }
        
        return content.trim() ? <p key={`${index}-${lIdx}`} style={{ marginBottom: '0.5rem' }}>{parsedTokens}</p> : <div key={`${index}-${lIdx}`} style={{ height: '0.5rem' }}></div>;
      });
    });
  };

  const chips = [
    'Latest AI trends in 2026',
    'Explain cloud computing vs edge computing',
    'Top cybersecurity certifications',
    'Design a study plan for exams',
    'How does Docker work?',
    'IT job market & salary insights'
  ];

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.2rem' }}>AI Academic Companion</h1>
          <p style={{ color: 'var(--text-muted)' }}>Ask about studies, programming, IT trends, cybersecurity, AI/ML, career guidance, and more.</p>
        </div>
        <button className="btn btn-secondary" onClick={clearChat} title="Clear conversation" style={{ padding: '0.65rem 0.95rem' }}>
          <Trash2 size={18} />
          <span>Clear Chat</span>
        </button>
      </header>

      {/* Main chat window */}
      <div className="chat-container">
        {/* Message logs */}
        <div className="chat-messages">
          {history.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role === 'user' ? 'user' : 'bot'}`}>
              <div className="chat-avatar">
                {msg.role === 'user' ? <User size={18} style={{ color: '#fff' }} /> : <Sparkles size={18} style={{ color: '#fff' }} />}
              </div>
              <div className="chat-bubble">
                {renderMessageContent(msg.content)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chat-message bot">
              <div className="chat-avatar">
                <Sparkles size={18} style={{ color: '#fff' }} />
              </div>
              <div className="chat-bubble">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="chat-input-bar-container" style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255, 255, 255, 0.65)', border: '1px solid var(--border-color)', borderTop: 'none', borderRadius: '0 0 var(--border-radius-lg) var(--border-radius-lg)', padding: '1rem' }}>
          {/* Suggestion Chips */}
          <div className="prompt-chips">
            {chips.map((chip, idx) => (
              <button key={idx} className="prompt-chip" onClick={() => handleChipClick(chip)} disabled={isLoading}>
                {chip}
              </button>
            ))}
          </div>

          {/* Form input */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
            <input 
              type="text" 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              placeholder="Ask about formulas, algorithms, essay outlines..."
              disabled={isLoading}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn" disabled={isLoading || !message.trim()} style={{ padding: '0.85rem 1.25rem' }}>
              <Send size={18} />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
