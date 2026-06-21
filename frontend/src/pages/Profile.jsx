import React, { useState, useEffect } from 'react';
import { User, Award, BookOpen, Save, RefreshCw, Plus, Trash2, CheckCircle2 } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: 'Daraniedaran K',
    regNo: '411621104001',
    college: 'Mailam Engineering College',
    department: 'Computer Science and Engineering',
    semester: '6',
    targetCgpa: '8.50',
  });

  const [goals, setGoals] = useState([
    'Maintain a GPA above 8.50 this semester',
    'Master advanced Data Structures and Algorithms',
    'Build a full-stack React and FastAPI project',
    'Prepare for upcoming placement drives'
  ]);

  const [newGoal, setNewGoal] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState({ ...profile });

  // Load profile and goals from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('sac_student_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
        setEditProfile(parsed);
      } catch (e) {
        console.error('Error loading profile:', e);
      }
    }

    const savedGoals = localStorage.getItem('sac_student_goals');
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch (e) {
        console.error('Error loading goals:', e);
      }
    }
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile(editProfile);
    localStorage.setItem('sac_student_profile', JSON.stringify(editProfile));
    
    // Trigger custom event to update sidebar / dashboard
    window.dispatchEvent(new Event('sac_profile_updated'));
    
    setSavedSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    const updatedGoals = [...goals, newGoal.trim()];
    setGoals(updatedGoals);
    localStorage.setItem('sac_student_goals', JSON.stringify(updatedGoals));
    setNewGoal('');
  };

  const handleDeleteGoal = (index) => {
    const updatedGoals = goals.filter((_, i) => i !== index);
    setGoals(updatedGoals);
    localStorage.setItem('sac_student_goals', JSON.stringify(updatedGoals));
  };

  // Get initials for profile picture
  const getInitials = (nameStr) => {
    return nameStr
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="animate-fadeIn">
      {/* Page Header */}
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.2rem' }}>Student Profile</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your academic identity, institution details, and personal milestones.</p>
        </div>
        {savedSuccess && (
          <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--accent-teal)', color: 'var(--accent-teal)', background: 'rgba(20, 184, 166, 0.05)', borderRadius: 'var(--border-radius-md)' }}>
            <CheckCircle2 size={16} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Profile Saved Successfully!</span>
          </div>
        )}
      </header>

      <div className="profile-container">
        {/* Left Side: ID Card Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(99, 102, 241, 0.05))', overflow: 'visible' }}>
            <div className="profile-card-header">
              <div className="profile-avatar-large">
                {getInitials(profile.name)}
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.1rem' }}>{profile.name}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em' }}>REG: {profile.regNo}</p>
              </div>
            </div>

            <div style={{ margin: '1.5rem 0', height: '1px', background: 'var(--border-color)' }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <BookOpen size={16} style={{ color: 'var(--primary)', marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Institution</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{profile.college}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <User size={16} style={{ color: 'var(--accent-teal)', marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Department</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{profile.department}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Award size={16} style={{ color: 'var(--accent-purple)', marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Current Standing</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>Semester {profile.semester} • Target CGPA: {profile.targetCgpa}</p>
                </div>
              </div>
            </div>

            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="btn" 
                style={{ width: '100%', marginTop: '1rem', background: 'var(--primary-gradient)' }}
              >
                <RefreshCw size={16} />
                <span>Edit Credentials</span>
              </button>
            )}
          </div>

          {/* Target Milestone Card */}
          <div className="glass-card accent-purple" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(99, 102, 241, 0.05))' }}>
            <Award size={36} style={{ color: 'var(--accent-purple)', marginBottom: '0.5rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Academic Goal CGPA</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
              {profile.targetCgpa}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Keep tracking your grades to stay aligned with your targets!</p>
          </div>
        </div>

        {/* Right Side: Edit Form / Goals Tracker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Edit Form */}
          {isEditing && (
            <div className="glass-card">
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>Edit Academic Details</h2>
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Student Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={editProfile.name}
                      onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Registration Number</label>
                    <input 
                      type="text" 
                      required
                      value={editProfile.regNo}
                      onChange={(e) => setEditProfile({ ...editProfile, regNo: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>College / University</label>
                  <input 
                    type="text" 
                    required
                    value={editProfile.college}
                    onChange={(e) => setEditProfile({ ...editProfile, college: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Department / Branch</label>
                  <select 
                    value={editProfile.department}
                    onChange={(e) => setEditProfile({ ...editProfile, department: e.target.value })}
                  >
                    <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                    <option value="Electrical and Electronics Engineering">Electrical and Electronics Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Current Semester</label>
                    <select 
                      value={editProfile.semester}
                      onChange={(e) => setEditProfile({ ...editProfile, semester: e.target.value })}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s.toString()}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Target CGPA (0.00 - 10.00)</label>
                    <input 
                      type="text" 
                      required
                      value={editProfile.targetCgpa}
                      onChange={(e) => setEditProfile({ ...editProfile, targetCgpa: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn btn-teal" style={{ flex: 1 }}>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditProfile({ ...profile });
                      setIsEditing(false);
                    }}
                    className="btn btn-secondary"
                  >
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Academic Goals Card */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>Milestones & Goals</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Set short-term or long-term goals for this semester. Check off objectives as they are met to stay focused.
            </p>

            <form onSubmit={handleAddGoal} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Add a new academic milestone..." 
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-teal" style={{ padding: '0.85rem' }}>
                <Plus size={18} />
                <span>Add</span>
              </button>
            </form>

            {goals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                <p style={{ fontWeight: 600 }}>No goals added yet</p>
                <p style={{ fontSize: '0.85rem' }}>Create goals above to start tracking milestones!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {goals.map((goal, idx) => (
                  <div key={idx} className="file-item" style={{ padding: '0.85rem 1rem' }}>
                    <div className="file-info" style={{ gap: '0.6rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{goal}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteGoal(idx)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', opacity: 0.8, display: 'flex', alignItems: 'center' }}
                      title="Remove Goal"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
