import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import AuthModal from './components/AuthModal';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import AccountDashboard from './pages/AccountDashboard';
import VideoPlayer from './pages/VideoPlayer';
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
          {/* Landing page - only for non-authenticated users */}
          <Route path="/landing" element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />
          
          {/* Home page - requires authentication */}
          <Route path="/" element={
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

          {/* Catch-all: redirect invalid URLs to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
