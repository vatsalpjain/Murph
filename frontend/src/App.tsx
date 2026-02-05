import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import AuthModal from './components/AuthModal';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import AccountDashboard from './pages/AccountDashboard';
import VideoPlayer from './pages/VideoPlayer';
import PaymentDashboard from './pages/PaymentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import './App.css';

/**
 * Main App - Routing Logic:
 * 
 * /landing    → PublicRoute  → Only for non-authenticated users
 * /           → ProtectedRoute → Only for authenticated users (HomePage)
 * /dashboard  → ProtectedRoute → Only for authenticated users
 * /video-player → ProtectedRoute → Only for authenticated users
 * /*          → Redirect to / (catch-all for 404s)
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Auth modal - shown when user clicks login/signup */}
        <AuthModal />

        <Routes>
          {/* Landing page - root path, accessible to all */}
          <Route path="/" element={<LandingPage />} />

          {/* Home page - requires authentication, role-aware content */}
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

          {/* Video player - requires authentication */}
          <Route path="/video-player" element={
            <ProtectedRoute>
              <VideoPlayer />
            </ProtectedRoute>
          } />

          {/* Teacher Dashboard - requires authentication */}
          <Route path="/teacher-dashboard" element={
            <ProtectedRoute>
              <TeacherDashboard />
            </ProtectedRoute>
          } />

          {/* Payment Dashboard - public for demo */}
          <Route path="/payment" element={<PaymentDashboard />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
