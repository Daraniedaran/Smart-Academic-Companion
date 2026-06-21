import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  FileUp, 
  GraduationCap, 
  MessageCircle, 
  ArrowRight,
  BookOpen,
  Calendar,
  Sparkles,
  User,
  Award
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const Dashboard = () => {
  const [greeting, setGreeting] = useState('');
  const [notesCount, setNotesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dateString, setDateString] = useState('');

  // Personalization State
  const [profile, setProfile] = useState({
    name: 'Daraniedaran K',
    regNo: '411621104001',
    college: 'Mailam Engineering College',
    department: 'Computer Science and Engineering',
    semester: '6',
    targetCgpa: '8.50'
  });
  const [cgpa, setCgpa] = useState('8.35'); // fallback / default CGPA

  useEffect(() => {
    // Determine greeting based on current local time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Format date string
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setDateString(new Date().toLocaleDateString('en-US', options));

    // Load profile
    const savedProfile = localStorage.getItem('sac_student_profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error('Error loading profile:', e);
      }
    }

    // Load computed CGPA
    const savedCgpa = localStorage.getItem('sac_computed_cgpa');
    if (savedCgpa) {
      setCgpa(savedCgpa);
    } else {
      // Look up semesters log as fallback
      const savedSemesters = localStorage.getItem('sac_au_semesters');
      if (savedSemesters) {
        try {
          const sem = JSON.parse(savedSemesters);
          if (sem.length > 0) {
            const totCredits = sem.reduce((acc, s) => acc + Number(s.credits), 0);
            const totProducts = sem.reduce((acc, s) => acc + (Number(s.gpa) * Number(s.credits)), 0);
            if (totCredits > 0) {
              setCgpa((totProducts / totCredits).toFixed(2));
            }
          }
        } catch (e) {}
      }
    }

    // Fetch notes count
    const fetchNotes = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/notes`);
        if (res.ok) {
          const data = await res.json();
          setNotesCount(data.notes ? data.notes.length : 0);
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();

    // Listen to updates
    const handleProfileUpdate = () => {
      const saved = localStorage.getItem('sac_student_profile');
      if (saved) {
        try {
          setProfile(JSON.parse(saved));
        } catch (e) {}
      }
    };
    const handleCgpaUpdate = () => {
      const val = localStorage.getItem('sac_computed_cgpa');
      if (val) setCgpa(val);
    };

    window.addEventListener('sac_profile_updated', handleProfileUpdate);
    window.addEventListener('sac_cgpa_updated', handleCgpaUpdate);

    return () => {
      window.removeEventListener('sac_profile_updated', handleProfileUpdate);
      window.removeEventListener('sac_cgpa_updated', handleCgpaUpdate);
    };
  }, []);

  // Split name to get first name
  const getFirstName = (fullName) => {
    return fullName.split(' ')[0];
  };

  return (
    <div className="animate-fadeIn">
      {/* Header Banner - Dual Layout */}
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.5rem', marginBottom: '0.25rem' }}>
            {greeting}, {getFirstName(profile.name)}! 👋
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome to your academic command center. What are we studying today?</p>
        </div>

        {/* Institution Badge Card */}
        <div className="glass-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: 'var(--border-radius-md)' }}>
          <BookOpen size={18} style={{ color: 'var(--primary)' }} />
          <div style={{ lineHeight: 1.2 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
              {profile.college}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Sem {profile.semester} • {profile.department}
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid: Statistics & Quick Summary */}
      <section className="grid-cols-1-2-4" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card">
          <div className="stat-icon primary">
            <Sparkles size={22} />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>AI Chatbot</span>
          <div className="stat-value">Active</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ready for questions</p>
        </div>

        <div className="glass-card accent-teal">
          <div className="stat-icon teal">
            <BookOpen size={22} />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Uploaded Notes</span>
          <div className="stat-value">{loading ? '...' : notesCount}</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>PDF and text files saved</p>
        </div>

        <div className="glass-card accent-purple">
          <div className="stat-icon purple">
            <GraduationCap size={22} />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Cumulative CGPA</span>
          <div className="stat-value">{cgpa}</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Target: {profile.targetCgpa} CGPA</p>
        </div>

        <div className="glass-card accent-rose">
          <div className="stat-icon rose">
            <MessageCircle size={22} />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Feedback Status</span>
          <div className="stat-value">Secure</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Anonymous transmission</p>
        </div>
      </section>

      {/* Actions Grid */}
      <h2 style={{ marginBottom: '1.25rem', fontFamily: 'var(--font-display)' }}>Academic Modules</h2>
      <section className="grid-cols-2" style={{ marginBottom: '2.5rem' }}>
        {/* Chatbot Module */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '200px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.4rem' }}>AI Academic Chatbot</h3>
              <MessageSquare size={24} style={{ color: 'var(--primary)' }} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Have questions about computer science algorithms, mathematical concepts, or resume formatting? Start a chat with your companion helper.
            </p>
          </div>
          <Link to="/chat" className="btn" style={{ alignSelf: 'flex-start' }}>
            <span>Consult Assistant</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Upload Notes Module */}
        <div className="glass-card accent-teal" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '200px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.4rem' }}>Study Notes Repository</h3>
              <FileUp size={24} style={{ color: 'var(--accent-teal)' }} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Upload and manage your course documents. Keep syllabus summaries, lecture slideshow notes, and practice exams organized in one folder.
            </p>
          </div>
          <Link to="/upload" className="btn btn-teal" style={{ alignSelf: 'flex-start' }}>
            <span>Manage Notes</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Performance Tracker Module */}
        <div className="glass-card accent-purple" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '200px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.4rem' }}>Anna University CGPA Calculator</h3>
              <GraduationCap size={24} style={{ color: 'var(--accent-purple)' }} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Calculate GPA for Regulation 2021 & 2017 semesters. Log semester standings and visualize CGPA trends relative to your target metrics.
            </p>
          </div>
          <Link to="/performance" className="btn" style={{ background: 'var(--accent-purple-gradient)', boxShadow: '0 4px 14px rgba(168, 85, 247, 0.3)', alignSelf: 'flex-start' }}>
            <span>Analyze Scores</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* AI Study Planner Module */}
        <div className="glass-card accent-teal" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '200px', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(20, 184, 166, 0.03))' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.4rem' }}>AI Study Planner</h3>
              <Calendar size={24} style={{ color: 'var(--accent-teal)' }} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Map your exam date and syllabus to generate a day-by-day structured study timeline. Track daily study checklist items and completion progress.
            </p>
          </div>
          <Link to="/planner" className="btn btn-teal" style={{ alignSelf: 'flex-start' }}>
            <span>Configure Schedule</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Profile Manager Module */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '200px', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(99, 102, 241, 0.03))' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.4rem' }}>Student Profile Manager</h3>
              <User size={24} style={{ color: 'var(--primary)' }} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Update your registration details, college affiliation, department branch, and customize your primary semester-wide academic goals.
            </p>
          </div>
          <Link to="/profile" className="btn" style={{ alignSelf: 'flex-start' }}>
            <span>Manage Profile</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Feedback Module */}
        <div className="glass-card accent-rose" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '200px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.4rem' }}>Anonymous Feedback Board</h3>
              <MessageCircle size={24} style={{ color: 'var(--accent-rose)' }} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Submit constructive criticism or suggestions regarding classes, amenities, or administrative processes without revealing your identity.
            </p>
          </div>
          <Link to="/feedback" className="btn" style={{ background: 'var(--accent-rose-gradient)', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)', alignSelf: 'flex-start' }}>
            <span>Submit Feedback</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Quote / Tip Section */}
      <section className="glass-card" style={{ borderLeft: '4px solid var(--primary)', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
        <Sparkles size={28} style={{ color: 'var(--primary)', flexShrink: 0 }} />
        <div>
          <h4 style={{ fontSize: '1.1rem', margin: 0 }}>Tip of the day</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            "Active recall is the most effective way to retain information. Try explaining new concepts in your own words to the AI Chatbot to verify your understanding!"
          </p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
