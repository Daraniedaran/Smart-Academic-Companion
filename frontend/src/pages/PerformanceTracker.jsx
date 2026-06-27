import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Trash2, 
  TrendingUp, 
  BookOpen,
  Info,
  Save,
  CheckCircle2
} from 'lucide-react';
import { AU_SUBJECTS_CATALOG, GRADE_POINTS, SEMESTERS } from '../services/constants';

const PerformanceTracker = () => {
  // --- Anna University GPA State ---
  const [auRegulation, setAuRegulation] = useState('2021'); // '2021' | '2017'
  const [currentCgpaSemester, setCurrentCgpaSemester] = useState('1'); // Master selected semester
  
  // Courses logged specifically for the active semester
  const [auCourses, setAuCourses] = useState([]);

  // Autocomplete suggestions state
  const [subjectCode, setSubjectCode] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [newAuCourse, setNewAuCourse] = useState({ name: '', credits: 3, grade: 'O' });
  const [auGpa, setAuGpa] = useState(0.00);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Cumulative CGPA calculation state
  const [auSemesters, setAuSemesters] = useState([
    { semester: 'Semester 1', gpa: 8.20, credits: 20 },
    { semester: 'Semester 2', gpa: 8.45, credits: 22 },
    { semester: 'Semester 3', gpa: 8.10, credits: 24 },
    { semester: 'Semester 4', gpa: 8.65, credits: 21 }
  ]);
  const [newSemesterVal, setNewSemesterVal] = useState({ name: 'Semester 5', gpa: '', credits: '' });
  const [auCgpa, setAuCgpa] = useState(0.00);
  const [targetCgpa, setTargetCgpa] = useState(8.50);

  // 1. Initial Load for general settings
  useEffect(() => {
    // Target CGPA from profile
    const savedProfile = localStorage.getItem('sac_student_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.targetCgpa) setTargetCgpa(Number(parsed.targetCgpa));
        if (parsed.semester) {
          setCurrentCgpaSemester(parsed.semester);
          const nextSem = Number(parsed.semester);
          setNewSemesterVal(prev => ({ ...prev, name: `Semester ${nextSem}` }));
        }
      } catch (e) {
        console.error(e);
      }
    }

    const savedAuSemesters = localStorage.getItem('sac_au_semesters');
    if (savedAuSemesters) {
      try {
        setAuSemesters(JSON.parse(savedAuSemesters));
      } catch (e) {}
    }
  }, []);

  // 2. Semester specific loading: Triggered whenever the master semester selection dropdown changes
  useEffect(() => {
    const key = `sac_au_courses_sem_${currentCgpaSemester}`;
    const savedCourses = localStorage.getItem(key);

    if (savedCourses) {
      try {
        setAuCourses(JSON.parse(savedCourses));
      } catch (e) {
        setAuCourses([]);
      }
    } else {
      // Seed default courses for Semester 1 to present a nice first-time configuration
      if (currentCgpaSemester === '1') {
        const defaultSem1 = [
          { code: 'HS3151', name: 'Professional English I', credits: 3, grade: 'A+' },
          { code: 'MA3151', name: 'Matrices and Calculus', credits: 4, grade: 'O' },
          { code: 'PH3151', name: 'Engineering Physics', credits: 3, grade: 'A' },
          { code: 'CY3151', name: 'Engineering Chemistry', credits: 3, grade: 'B+' },
          { code: 'GE3151', name: 'Problem Solving and Python Programming', credits: 3, grade: 'O' }
        ];
        setAuCourses(defaultSem1);
        localStorage.setItem(key, JSON.stringify(defaultSem1));
      } else {
        // Refreshes and shows a clean/blank list for other semesters
        setAuCourses([]);
      }
    }
    // Clear code autocomplete state when semester swaps
    setSubjectCode('');
    setSuggestions([]);
    setShowSuggestions(false);
  }, [currentCgpaSemester]);

  const auGradePoints = GRADE_POINTS;

  // Compute Anna University GPA
  useEffect(() => {
    if (auCourses.length === 0) {
      setAuGpa(0.00);
      return;
    }
    let totalGradeProducts = 0;
    let totalCredits = 0;
    const mapping = auGradePoints[auRegulation];

    auCourses.forEach(c => {
      const gp = mapping[c.grade] !== undefined ? mapping[c.grade] : 0;
      const cred = Number(c.credits);
      totalGradeProducts += (gp * cred);
      totalCredits += cred;
    });

    const calculatedGpa = totalCredits > 0 ? (totalGradeProducts / totalCredits) : 0.00;
    setAuGpa(Number(calculatedGpa.toFixed(2)));
  }, [auCourses, auRegulation]);

  // Compute Cumulative CGPA whenever semesters change
  useEffect(() => {
    if (auSemesters.length === 0) {
      setAuCgpa(0.00);
      return;
    }
    let totalGpaCredits = 0;
    let totalCredits = 0;
    auSemesters.forEach(s => {
      totalGpaCredits += (Number(s.gpa) * Number(s.credits));
      totalCredits += Number(s.credits);
    });

    const calculatedCgpa = totalCredits > 0 ? (totalGpaCredits / totalCredits) : 0.00;
    setAuCgpa(Number(calculatedCgpa.toFixed(2)));

    // Save CGPA to local storage to show on Dashboard
    localStorage.setItem('sac_computed_cgpa', calculatedCgpa.toFixed(2));
    window.dispatchEvent(new Event('sac_cgpa_updated'));
  }, [auSemesters]);

  // Save changes to current semester in localStorage
  const saveCurrentSemesterCourses = (updatedCourses) => {
    localStorage.setItem(`sac_au_courses_sem_${currentCgpaSemester}`, JSON.stringify(updatedCourses));
  };

  // --- Auto-suggestion implementation ---
  const handleSubjectCodeChange = (val) => {
    setSubjectCode(val);
    if (!val.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const cleanedVal = val.trim().toUpperCase();
    const filtered = AU_SUBJECTS_CATALOG.filter(s => 
      s.code.toUpperCase().includes(cleanedVal) || 
      s.name.toUpperCase().includes(cleanedVal)
    ).slice(0, 6);

    setSuggestions(filtered);
    setShowSuggestions(true);

    // If there is an exact match on code, auto-fill details
    const exactMatch = AU_SUBJECTS_CATALOG.find(s => s.code.toUpperCase() === cleanedVal);
    if (exactMatch) {
      setNewAuCourse(prev => ({
        ...prev,
        name: exactMatch.name,
        credits: exactMatch.credits
      }));
    }
  };

  const handleSelectSuggestion = (s) => {
    setSubjectCode(s.code);
    setNewAuCourse({
      name: s.name,
      credits: s.credits,
      grade: newAuCourse.grade
    });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // --- Handlers for GPA course modification ---
  const handleAddAuCourse = (e) => {
    e.preventDefault();
    if (!newAuCourse.name.trim()) return;
    
    // Check grade compatibility with regulation
    if (auRegulation === '2017' && newAuCourse.grade === 'C') {
      alert("Grade 'C' is not available under Regulation 2017. Please choose O, A+, A, B+, B, or RA.");
      return;
    }

    const updated = [...auCourses, { 
      code: subjectCode.trim().toUpperCase() || 'N/A',
      name: newAuCourse.name.trim(), 
      credits: Number(newAuCourse.credits), 
      grade: newAuCourse.grade 
    }];
    
    setAuCourses(updated);
    saveCurrentSemesterCourses(updated);
    
    // Reset course inputs
    setNewAuCourse({ name: '', credits: 3, grade: 'O' });
    setSubjectCode('');
  };

  const handleDeleteAuCourse = (index) => {
    const updated = auCourses.filter((_, idx) => idx !== index);
    setAuCourses(updated);
    saveCurrentSemesterCourses(updated);
  };

  const handleSaveAuSemester = () => {
    if (auCourses.length === 0) {
      alert('No courses in the current semester inventory to save.');
      return;
    }
    
    const totalCredits = auCourses.reduce((acc, c) => acc + Number(c.credits), 0);
    const semName = `Semester ${currentCgpaSemester}`;
    
    const filteredSemesters = auSemesters.filter(s => s.semester !== semName);
    const updatedSemesters = [...filteredSemesters, {
      semester: semName,
      gpa: auGpa,
      credits: totalCredits
    }].sort((a, b) => {
      const numA = Number(a.semester.replace(/\D/g, '')) || 0;
      const numB = Number(b.semester.replace(/\D/g, '')) || 0;
      return numA - numB;
    });

    setAuSemesters(updatedSemesters);
    localStorage.setItem('sac_au_semesters', JSON.stringify(updatedSemesters));
    
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddSemesterCgpa = (e) => {
    e.preventDefault();
    if (!newSemesterVal.gpa || !newSemesterVal.credits) return;
    
    const gpaNum = Number(newSemesterVal.gpa);
    const credNum = Number(newSemesterVal.credits);

    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 10) {
      alert('GPA must be a number between 0.00 and 10.00');
      return;
    }
    if (isNaN(credNum) || credNum <= 0) {
      alert('Credits must be a positive number');
      return;
    }

    const filteredSemesters = auSemesters.filter(s => s.semester !== newSemesterVal.name);
    const updatedSemesters = [...filteredSemesters, {
      semester: newSemesterVal.name,
      gpa: gpaNum,
      credits: credNum
    }].sort((a, b) => {
      const numA = Number(a.semester.replace(/\D/g, '')) || 0;
      const numB = Number(b.semester.replace(/\D/g, '')) || 0;
      return numA - numB;
    });

    setAuSemesters(updatedSemesters);
    localStorage.setItem('sac_au_semesters', JSON.stringify(updatedSemesters));
    
    const nextSemNum = Number(newSemesterVal.name.replace(/\D/g, '')) + 1;
    setNewSemesterVal({
      name: isNaN(nextSemNum) ? 'Semester' : `Semester ${nextSemNum}`,
      gpa: '',
      credits: ''
    });
  };

  const handleDeleteAuSemester = (index) => {
    const updated = auSemesters.filter((_, idx) => idx !== index);
    setAuSemesters(updated);
    localStorage.setItem('sac_au_semesters', JSON.stringify(updated));
  };

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.2rem' }}>Anna University CGPA Calculator</h1>
          <p style={{ color: 'var(--text-muted)' }}>Calculate credit GPA standings for Regulation 2021 & 2017 with auto-suggesting subject databases.</p>
        </div>
      </header>

      {/* CGPA & Semester summary headers */}
      <section className="grid-cols-1-2-4" style={{ marginBottom: '2rem' }}>
        <div className="glass-card accent-teal" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.05), rgba(99, 102, 241, 0.03))' }}>
          <div className="stat-icon teal" style={{ marginBottom: 0 }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>CUMULATIVE CGPA</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-teal)', margin: 0 }}>
              {auCgpa.toFixed(2)} / 10.00
            </p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className="stat-icon purple" style={{ marginBottom: 0 }}>
            <GraduationCap size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>SEM GPA PREVIEW</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{auGpa.toFixed(2)}</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className="stat-icon primary" style={{ marginBottom: 0 }}>
            <BookOpen size={20} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>TARGET CGPA</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>{targetCgpa.toFixed(2)}</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className="stat-icon primary" style={{ marginBottom: 0, background: 'rgba(99,102,241,0.08)' }}>
            <Info size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>STANDING</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              {auCgpa >= 8.5 ? 'Distinction Class' : auCgpa >= 6.5 ? 'First Class' : auCgpa >= 5.0 ? 'Second Class' : 'RA (Arrears)'}
            </p>
          </div>
        </div>
      </section>

      {/* GPA and CGPA side-by-side modules */}
      <div className="grid-cols-2" style={{ alignItems: 'start', marginBottom: '2.5rem' }}>
        
        {/* Semester GPA Calculator */}
        <div className="glass-card">
          <div className="card-header-actions">
            <div>
              <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Semester GPA Calculator</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Choose a semester to load courses or catalog a new blank slate.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Semester Master Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>SEMESTER:</span>
                <select 
                  value={currentCgpaSemester}
                  onChange={(e) => setCurrentCgpaSemester(e.target.value)}
                  style={{ padding: '0.4rem 0.85rem', width: 'auto', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  {SEMESTERS.map(s => (
                    <option key={s} value={s.toString()}>Semester {s}</option>
                  ))}
                </select>
              </div>

              {/* Regulation Selector */}
              <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0, 0, 0, 0.03)', padding: '3px', borderRadius: '20px' }}>
                <button 
                  onClick={() => setAuRegulation('2021')} 
                  className={`pomodoro-mode-btn ${auRegulation === '2021' ? 'active' : ''}`}
                  style={{ padding: '0.35rem 0.75rem', width: 'auto' }}
                >
                  Reg 2021
                </button>
                <button 
                  onClick={() => setAuRegulation('2017')} 
                  className={`pomodoro-mode-btn ${auRegulation === '2017' ? 'active' : ''}`}
                  style={{ padding: '0.35rem 0.75rem', width: 'auto' }}
                >
                  Reg 2017
                </button>
              </div>
            </div>
          </div>

          {/* Course Addition Form with Autocomplete */}
          <form onSubmit={handleAddAuCourse} className="course-input-row" style={{ marginBottom: '1.5rem', position: 'relative' }}>
            <div className="autocomplete-wrapper">
              <input 
                type="text" 
                placeholder="Code (e.g. CS3492)"
                value={subjectCode}
                onChange={(e) => handleSubjectCodeChange(e.target.value)}
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.map((s, sIdx) => (
                    <li 
                      key={sIdx} 
                      className="suggestion-item"
                      onMouseDown={() => handleSelectSuggestion(s)}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        <span style={{ fontWeight: 'bold' }}><span className="suggestion-code">{s.code}</span>{s.name}</span>
                      </div>
                      <span className="suggestion-credits">{s.credits} Cr</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <input 
              type="text" 
              required
              placeholder="Course Title"
              value={newAuCourse.name}
              onChange={(e) => setNewAuCourse({ ...newAuCourse, name: e.target.value })}
            />

            <select 
              value={newAuCourse.credits}
              onChange={(e) => setNewAuCourse({ ...newAuCourse, credits: Number(e.target.value) })}
            >
              <option value="1">1 Credit</option>
              <option value="1.5">1.5 Credits</option>
              <option value="2">2 Credits</option>
              <option value="3">3 Credits</option>
              <option value="4">4 Credits</option>
              <option value="5">5 Credits</option>
              <option value="6">6 Credits</option>
            </select>

            <select 
              value={newAuCourse.grade}
              onChange={(e) => setNewAuCourse({ ...newAuCourse, grade: e.target.value })}
            >
              <option value="O">O (Outstanding)</option>
              <option value="A+">A+ (Excellent)</option>
              <option value="A">A (Very Good)</option>
              <option value="B+">B+ (Good)</option>
              <option value="B">B (Average)</option>
              {auRegulation === '2021' && <option value="C">C (Satisfactory)</option>}
              <option value="RA">RA (Re-Appearance)</option>
            </select>

            <button type="submit" className="btn btn-teal" style={{ padding: '0.85rem' }} title="Add Course">
              <Plus size={18} />
            </button>
          </form>

          {/* Course rows listing */}
          {auCourses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--text-muted)' }}>
              <p style={{ fontWeight: 600 }}>No courses cataloged for Semester {currentCgpaSemester}.</p>
              <p style={{ fontSize: '0.85rem' }}>Add courses above to start computing your GPA for this term.</p>
            </div>
          ) : (
            <div className="table-container" style={{ maxHeight: '280px', overflowY: 'auto' }}>
              <table className="academic-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Course</th>
                    <th>Credits</th>
                    <th>Grade</th>
                    <th>Points</th>
                    <th style={{ textAlign: 'center' }}>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {auCourses.map((c, idx) => {
                    const gpMapping = auGradePoints[auRegulation];
                    const pointVal = gpMapping[c.grade] !== undefined ? gpMapping[c.grade] : 0;
                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>{c.code || 'N/A'}</td>
                        <td style={{ fontWeight: 500 }}>{c.name}</td>
                        <td>{c.credits} Credits</td>
                        <td>
                          <span className={`badge ${pointVal > 5 ? 'badge-blue' : pointVal > 0 ? 'badge-orange' : 'badge-red'}`}>
                            {c.grade}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{pointVal}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            onClick={() => handleDeleteAuCourse(idx)}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', opacity: 0.8 }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Semester Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {savedSuccess && (
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-teal)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <CheckCircle2 size={14} /> Saved to Log!
                </span>
              )}
              <button 
                onClick={handleSaveAuSemester}
                className="btn btn-secondary" 
                style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.4rem', alignItems: 'center', border: '1px solid var(--accent-teal)', color: 'var(--accent-teal)' }}
              >
                <Save size={16} />
                <span>Save Semester {currentCgpaSemester} GPA</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cumulative CGPA Calculator */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>Semester Log & CGPA</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Aggregate all semesters' GPAs to compute your final standing.
          </p>

          {/* CGPA Progress Visual Ring / Gauge */}
          <div className="gpa-summary-card">
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Cumulative CGPA</p>
            <div className="gpa-summary-val">{auCgpa.toFixed(2)}</div>
            
            {/* Visual indicator relative to target CGPA */}
            <div style={{ margin: '1rem 0 0.5rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                <span>Progress to Target ({targetCgpa.toFixed(2)})</span>
                <span>{auCgpa >= targetCgpa ? 'Target Achieved!' : `${Math.round((auCgpa / targetCgpa) * 100)}%`}</span>
              </div>
              <div className="planner-progress-bar" style={{ height: '6px' }}>
                <div 
                  className="planner-progress-fill" 
                  style={{ 
                    width: `${Math.min((auCgpa / targetCgpa) * 100, 100)}%`,
                    background: auCgpa >= targetCgpa ? 'var(--accent-teal-gradient)' : 'var(--primary-gradient)'
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Add Semester Row Manually */}
          <form onSubmit={handleAddSemesterCgpa} className="course-input-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 0.5fr', marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              required
              placeholder="e.g. Semester 5"
              value={newSemesterVal.name}
              onChange={(e) => setNewSemesterVal({ ...newSemesterVal, name: e.target.value })}
            />
            <input 
              type="text" 
              required
              placeholder="GPA"
              value={newSemesterVal.gpa}
              onChange={(e) => setNewSemesterVal({ ...newSemesterVal, gpa: e.target.value })}
            />
            <input 
              type="text" 
              required
              placeholder="Credits"
              value={newSemesterVal.credits}
              onChange={(e) => setNewSemesterVal({ ...newSemesterVal, credits: e.target.value })}
            />
            <button type="submit" className="btn btn-teal" style={{ padding: '0.85rem' }} title="Log Semester">
              <Plus size={18} />
            </button>
          </form>

          {/* Logged semesters listing */}
          {auSemesters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
              <p style={{ fontWeight: 600 }}>No semesters logged yet.</p>
              <p style={{ fontSize: '0.85rem' }}>Log GPAs above to compute your cumulative CGPA.</p>
            </div>
          ) : (
            <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <table className="academic-table">
                <thead>
                  <tr>
                    <th>Semester</th>
                    <th>GPA</th>
                    <th>Credits</th>
                    <th style={{ textAlign: 'center' }}>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {auSemesters.map((s, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{s.semester}</td>
                      <td style={{ color: 'var(--accent-teal)', fontWeight: 700 }}>{Number(s.gpa).toFixed(2)}</td>
                      <td>{s.credits} Credits</td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => handleDeleteAuSemester(idx)}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', opacity: 0.8 }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PerformanceTracker;
