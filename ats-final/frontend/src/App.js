import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PublicJobList from './pages/PublicJobList';
import JobDetail from './pages/JobDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateProfile from './pages/candidate/CandidateProfile';
import MyApplications from './pages/candidate/MyApplications';
import ApplyJob from './pages/candidate/ApplyJob';
import InterviewScheduled from './pages/candidate/InterviewScheduled';
import HRDashboard from './pages/hr/HRDashboard';
import ManageJobs from './pages/hr/ManageJobs';
import ManageApplicants from './pages/hr/ManageApplicants';
import ManageInterviews from './pages/hr/ManageInterviews';
import ManageBranches from './pages/hr/ManageBranches';
// Placeholder components to prevent React from crashing until real pages are created
const Placeholder = ({ title }) => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h2>{title} Component</h2>
    <p>Coming soon...</p>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Navbar />
            <div style={{ minHeight: 'calc(100vh - 70px)' }}>
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicJobList />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Candidate Protected Routes */}
              <Route 
                path="/candidate/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <CandidateDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/candidate/profile" 
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <CandidateProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/candidate/applications" 
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <MyApplications />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/candidate/apply/:jobId" 
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <ApplyJob />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/candidate/interview" 
                element={
                  <ProtectedRoute allowedRoles={['candidate']}>
                    <InterviewScheduled />
                  </ProtectedRoute>
                } 
              />

              {/* HR/Admin Protected Routes */}
              <Route 
                path="/hr/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['hr', 'admin']}>
                    <HRDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/hr/jobs" 
                element={
                  <ProtectedRoute allowedRoles={['hr', 'admin']}>
                    <ManageJobs />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/hr/applicants" 
                element={
                  <ProtectedRoute allowedRoles={['hr', 'admin']}>
                    <ManageApplicants />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/hr/interviews" 
                element={
                  <ProtectedRoute allowedRoles={['hr', 'admin']}>
                    <ManageInterviews />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/hr/branches" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageBranches />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  </ThemeProvider>
  );
}

export default App;
