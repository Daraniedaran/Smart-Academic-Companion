import React, { useState, useEffect } from 'react';
import { Calendar, Sparkles, RefreshCw, Loader, CheckCircle2, ChevronRight } from 'lucide-react';
import { api } from '../services/api';

const StudyPlanner = () => {
  const [subject, setSubject] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [topics, setTopics] = useState('');
  const [studyHours, setStudyHours] = useState('2');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loadingStep, setLoadingStep] = useState('');

  // Load plan from localStorage on mount
  useEffect(() => {
    const savedPlan = localStorage.getItem('sac_active_study_plan');
    if (savedPlan) {
      try {
        setCurrentPlan(JSON.parse(savedPlan));
      } catch (e) {
        console.error('Error parsing saved study plan:', e);
      }
    }
  }, []);

  const savePlan = (plan) => {
    setCurrentPlan(plan);
    if (plan) {
      localStorage.setItem('sac_active_study_plan', JSON.stringify(plan));
    } else {
      localStorage.removeItem('sac_active_study_plan');
    }
  };

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !targetDate || !topics.trim()) {
      alert('Please fill out all fields to generate a plan.');
      return;
    }

    setIsLoading(true);
    setLoadingStep('Sifting syllabus topics...');

    // Calculate days until exam
    const today = new Date();
    today.setHours(0,0,0,0);
    const exam = new Date(targetDate);
    exam.setHours(0,0,0,0);
    const diffTime = exam.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      alert('The exam date must be in the future.');
      setIsLoading(false);
      return;
    }

    // Cap the plan duration at a reasonable 14 days for local study roadmap, or calculate dynamically
    const planDuration = Math.min(diffDays, 14);

    setTimeout(() => {
      setLoadingStep('Optimizing cognitive load intervals...');
    }, 1000);

    setTimeout(() => {
      setLoadingStep('Compiling study timetable...');
    }, 2000);

    // Call the backend API to try to generate plan or compile a fallback plan
    const topicList = topics.split(/[,\n]/).map(t => t.trim()).filter(Boolean);
    const formattedTopics = topicList.map(t => `- ${t}`).join('\n');
    const prompt = `Act as an academic planner. Create a daily study plan for the subject "${subject}" to prepare for an exam in ${diffDays} days (planned over ${planDuration} study days).
Daily study limit: ${studyHours} hours.
Topics to cover:
${formattedTopics}

Respond ONLY with a valid JSON array matching this exact schema:
[
  {
    "day": 1,
    "title": "Introduction & Topic Name",
    "tasks": ["Read chapter 1 notes", "Revise formulas"],
    "completed": false
  }
]
No other text before or after the JSON.`;

    try {
      const data = await api.chat(prompt);
      const jsonMatch = data.response.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        const parsedPlan = JSON.parse(jsonMatch[0]);
        savePlan({
          subject,
          targetDate,
          daysLeft: diffDays,
          totalDays: planDuration,
          schedule: parsedPlan
        });
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend API connection failed, creating a client-side plan fallback.', err);
    }

    // Client-side fallback generator if backend/AI fails or is missing key
    const schedule = [];
    const itemsPerDay = Math.ceil(topicList.length / planDuration);

    for (let i = 1; i <= planDuration; i++) {
      const startIdx = (i - 1) * itemsPerDay;
      const dayTopics = topicList.slice(startIdx, startIdx + itemsPerDay);
      
      const dayTasks = [];
      if (dayTopics.length > 0) {
        dayTopics.forEach(topic => {
          dayTasks.push(`Study and summarize: ${topic}`);
          dayTasks.push(`Practice 3 sample problems on: ${topic}`);
        });
      } else {
        dayTasks.push(`Comprehensive review of previous topics`);
        dayTasks.push(`Take a self-assessment practice test`);
      }

      schedule.push({
        day: i,
        title: dayTopics.length > 0 ? `Focus: ${dayTopics.join(' & ')}` : 'Review & Practice Test',
        tasks: dayTasks,
        completed: false
      });
    }

    // Add final revision day tasks to the last day if it's the last day
    if (planDuration > 1) {
      const lastDay = schedule[schedule.length - 1];
      lastDay.title = `Review & ${lastDay.title}`;
      lastDay.tasks = [
        ...lastDay.tasks,
        `Review all notes and compiled summaries for ${subject}`,
        `Solve past exam papers under timed conditions`,
        `Get 8 hours of rest before the exam!`
      ];
    }

    // Save final plan structure
    savePlan({
      subject,
      targetDate,
      daysLeft: diffDays,
      totalDays: planDuration,
      schedule
    });
    
    setIsLoading(false);
  };

  const handleToggleTask = (dayIndex, taskIndex) => {
    if (!currentPlan) return;
    const updatedPlan = { ...currentPlan };
    const day = updatedPlan.schedule[dayIndex];
    
    // Toggle individual task status can be managed, or toggle complete day
    // Let's toggle the day card completion status for simplicity and clean layout
    day.completed = !day.completed;
    savePlan(updatedPlan);
  };

  const handleResetPlan = () => {
    if (window.confirm('Are you sure you want to clear this study plan? All progress will be lost.')) {
      savePlan(null);
      setSubject('');
      setTargetDate('');
      setTopics('');
    }
  };

  // Compute overall progress
  const getProgress = () => {
    if (!currentPlan || currentPlan.schedule.length === 0) return 0;
    const completedDays = currentPlan.schedule.filter(d => d.completed).length;
    return Math.round((completedDays / currentPlan.schedule.length) * 100);
  };

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <header className="page-header">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.2rem' }}>AI Study Planner</h1>
        <p style={{ color: 'var(--text-muted)' }}>Input your exam timeline and topics, and the AI agent will compile a day-by-day study roadmap.</p>
      </header>

      {/* Main Grid: Form / Plan Display */}
      {!currentPlan ? (
        <div className="glass-card" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Sparkles size={24} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Configure Study Roadmap</h2>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
              <Loader size={48} className="animate-spin" style={{ color: 'var(--primary)' }} />
              <p style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-main)' }}>{loadingStep}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Creating structured timetable intervals...</p>
            </div>
          ) : (
            <form onSubmit={handleGeneratePlan} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Subject Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Database Systems"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Exam Target Date</label>
                  <input 
                    type="date" 
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Daily Target Study (Hours)</label>
                <select 
                  value={studyHours}
                  onChange={(e) => setStudyHours(e.target.value)}
                >
                  <option value="1">1 Hour per day</option>
                  <option value="2">2 Hours per day</option>
                  <option value="3">3 Hours per day</option>
                  <option value="4">4+ Hours per day</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Syllabus / Topics (one per line or comma-separated)</label>
                <textarea 
                  required
                  rows="5"
                  placeholder="e.g.&#10;ER Diagrams&#10;Relational Algebra&#10;SQL Queries & Joins&#10;Normalization (1NF, 2NF, 3NF, BCNF)&#10;Indexing & Hashing&#10;Transaction Management"
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-teal" style={{ marginTop: '0.5rem' }}>
                <Sparkles size={16} />
                <span>Generate Roadmap</span>
              </button>
            </form>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          {/* Header Summary */}
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.05), rgba(99, 102, 241, 0.05))' }}>
            <div>
              <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>Active Study Roadmap</span>
              <h2 style={{ fontSize: '1.8rem', margin: '0.2rem 0' }}>{currentPlan.subject} Preparation</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                Targeting exam on {new Date(currentPlan.targetDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} ({currentPlan.daysLeft} days remaining)
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button onClick={handleResetPlan} className="btn btn-secondary">
                <RefreshCw size={16} />
                <span>Reset Plan</span>
              </button>
            </div>
          </div>

          {/* Progress Tracker Widget */}
          <div className="glass-card">
            <div className="planner-progress-container" style={{ margin: 0 }}>
              <div className="planner-progress-info">
                <span>TIMELINE PROGRESS</span>
                <span>{getProgress()}% COMPLETED</span>
              </div>
              <div className="planner-progress-bar">
                <div className="planner-progress-fill" style={{ width: `${getProgress()}%` }}></div>
              </div>
            </div>
          </div>

          {/* Day Milestones List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', margin: 0 }}>Timetable Schedule</h2>
            <div className="planner-roadmap">
              {currentPlan.schedule.map((day, dIdx) => (
                <div 
                  key={dIdx} 
                  className={`planner-day-card ${day.completed ? 'completed' : ''}`}
                  onClick={() => handleToggleTask(dIdx)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="planner-day-header">
                    <div className="planner-day-title">
                      <Calendar size={18} style={{ color: day.completed ? 'var(--accent-teal)' : 'var(--primary)' }} />
                      <span>Day {day.day}: {day.title}</span>
                    </div>
                    <div>
                      {day.completed ? (
                        <span className="badge badge-green" style={{ gap: '0.25rem' }}>
                          <CheckCircle2 size={12} />
                          Completed
                        </span>
                      ) : (
                        <span className="badge badge-blue">In Progress</span>
                      )}
                    </div>
                  </div>

                  <ul className="planner-day-tasks" style={{ marginTop: '0.5rem' }}>
                    {day.tasks.map((task, tIdx) => (
                      <li key={tIdx} className="planner-day-task-item">
                        <ChevronRight size={14} style={{ color: 'var(--text-muted)', marginTop: '4px', flexShrink: 0 }} />
                        <span style={{ textDecoration: day.completed ? 'line-through' : 'none', opacity: day.completed ? 0.6 : 1 }}>
                          {task}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;
