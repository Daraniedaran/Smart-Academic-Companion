import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import UploadNotes from './pages/UploadNotes';
import PerformanceTracker from './pages/PerformanceTracker';
import StudyPlanner from './pages/StudyPlanner';
import Profile from './pages/Profile';
import Feedback from './pages/Feedback';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<Chatbot />} />
          <Route path="/upload" element={<UploadNotes />} />
          <Route path="/performance" element={<PerformanceTracker />} />
          <Route path="/planner" element={<StudyPlanner />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
