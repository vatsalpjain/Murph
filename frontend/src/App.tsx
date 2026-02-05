import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, RoleProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import AuthModal from './components/AuthModal';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import AccountDashboard from './pages/AccountDashboard';
import VideoPlayer from './pages/VideoPlayer';
import PaymentDashboard from './pages/PaymentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import FindSession from './pages/FindSession';
import ProfilePage from './pages/ProfilePage';
import './App.css';

/**
 * Main App - Routing Logic:
 * 
 * PUBLIC ROUTES:
 * /                 → Landing page (redirects to /home if logged in)
 * /payment          → Payment gateway (public for demo)
 * 
 * PROTECTED ROUTES (require authentication):
 * /home             → Main home page for authenticated users
 * /dashboard        → Unified account dashboard (student/teacher)
 * /profile          → User profile and settings
 * /student-dashboard→ Redirects to /dashboard (single dashboard approach)
 * /video-player     → Video watching page (supports ?v=videoId param)
 * /find-session     → Browse sessions/domains
 * 
 * ROLE-PROTECTED ROUTES (teacher only):
 * /teacher-dashboard→ Teacher-specific analytics dashboard
 * 
 * CATCH-ALL:
 * /*                → Redirects to / (landing)
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Auth modal - shown when user clicks login/signup */}
        <AuthModal />

        <Routes>
          {/* Landing page - redirects logged-in users to /home */}
          <Route path="/" element={
            <PublicOnlyRoute>
              <LandingPage />
            </PublicOnlyRoute>
          } />

          {/* Home page - requires authentication */}
          <Route path="/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />

          {/* Dashboard - requires authentication */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AccountDashboard />
            </ProtectedRoute>
          } />

          {/* Profile - requires authentication */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* Video player - requires authentication, supports ?v=videoId */}
          <Route path="/video-player" element={
            <ProtectedRoute>
              <VideoPlayer />
            </ProtectedRoute>
          } />

          {/* Teacher Dashboard - requires teacher role */}
          <Route path="/teacher-dashboard" element={
            <RoleProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </RoleProtectedRoute>
          } />

          {/* Student Dashboard - redirects to unified dashboard */}
          <Route path="/student-dashboard" element={
            <ProtectedRoute>
              <AccountDashboard />
            </ProtectedRoute>
          } />

          {/* Find Session - browse domains/sessions */}
          <Route path="/find-session" element={
            <ProtectedRoute>
              <FindSession />
            </ProtectedRoute>
          } />

          {/* Payment Dashboard - public for demo */}
          <Route path="/payment" element={<PaymentDashboard />} />

          {/* Catch-all: redirect unknown routes to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
