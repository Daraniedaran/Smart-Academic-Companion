import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileUp, 
  GraduationCap, 
  MessageCircle,
  BookOpen,
  User,
  Calendar,
  Play,
  Pause,
  RotateCcw,
  Timer
} from 'lucide-react';

const Layout = ({ children }) => {
  // Sync profile details in the sidebar
  const [profileName, setProfileName] = useState('Daraniedaran K');
  
  useEffect(() => {
    const loadProfile = () => {
      const saved = localStorage.getItem('sac_student_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.name) setProfileName(parsed.name);
        } catch (e) {
          console.error(e);
        }
      }
    };
    loadProfile();
    window.addEventListener('sac_profile_updated', loadProfile);
    return () => window.removeEventListener('sac_profile_updated', loadProfile);
  }, []);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Pomodoro Focus Timer Widget State
  const [pomodoroMode, setPomodoroMode] = useState('focus'); // focus (25m), short (5m), long (15m)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // Time durations mapping
  const modeDurations = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
  };

  useEffect(() => {
    setTimeLeft(modeDurations[pomodoroMode]);
    setIsTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [pomodoroMode]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const playAlarmSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz pitch
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn("Audio Context blocked by browser auto-play policy:", e);
    }
  };

  const handleStartPause = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setIsTimerRunning(true);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            playAlarmSound();
            alert(`Pomodoro ${pomodoroMode.toUpperCase()} session finished! Time to shift states.`);
            return modeDurations[pomodoroMode];
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(modeDurations[pomodoroMode]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar" style={{ height: 'auto', minHeight: '100vh' }}>
        <div className="sidebar-logo">
          <BookOpen size={28} style={{ color: 'var(--primary)' }} />
          <span>Academic Companion</span>
        </div>

        {/* Sidebar Mini Profile Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', padding: '0 0.5rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary-gradient)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
            {getInitials(profileName)}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profileName}</p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Student Workspace</span>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          <ul className="sidebar-menu">
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                end
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/chat" 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <MessageSquare size={20} />
                <span>AI Chatbot</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/upload" 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <FileUp size={20} />
                <span>Upload Notes</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/performance" 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <GraduationCap size={20} />
                <span>Performance</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/planner" 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Calendar size={20} />
                <span>AI Study Planner</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/profile" 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <User size={20} />
                <span>My Profile</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/feedback" 
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <MessageCircle size={20} />
                <span>Feedback</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Focus Timer Widget */}
        <div className="pomodoro-widget">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            <Timer size={14} style={{ color: 'var(--accent-rose)' }} />
            <span>FOCUS TIMER</span>
          </div>

          <div className="pomodoro-modes">
            <button 
              className={`pomodoro-mode-btn ${pomodoroMode === 'focus' ? 'active' : ''}`}
              onClick={() => setPomodoroMode('focus')}
            >
              Work
            </button>
            <button 
              className={`pomodoro-mode-btn ${pomodoroMode === 'short' ? 'active' : ''}`}
              onClick={() => setPomodoroMode('short')}
            >
              Short
            </button>
            <button 
              className={`pomodoro-mode-btn ${pomodoroMode === 'long' ? 'active' : ''}`}
              onClick={() => setPomodoroMode('long')}
            >
              Long
            </button>
          </div>

          <div className="pomodoro-timer-display">
            {formatTime(timeLeft)}
          </div>

          <div className="pomodoro-controls">
            <button className={`pomodoro-btn ${isTimerRunning ? 'active' : ''}`} onClick={handleStartPause}>
              {isTimerRunning ? <Pause size={12} /> : <Play size={12} />}
              <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
            </button>
            <button className="pomodoro-btn" onClick={handleResetTimer}>
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="sidebar-footer" style={{ marginTop: '1.5rem' }}>
          <p>Smart Academic Companion</p>
          <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>v1.1.0 • Premium Environment</p>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
