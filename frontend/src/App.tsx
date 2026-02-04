import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import AccountDashboard from './pages/AccountDashboard';
import VideoPlayer from './pages/VideoPlayer';
import './App.css';

/**
 * Main App component - handles routing and authentication
 * Wrapped with AuthProvider for global auth state
 * AuthModal appears as overlay when triggered
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Auth modal overlay - shown when user clicks login/signup */}
        <AuthModal />
        
        <Routes>
          {/* Main home route - displays home page */}
          <Route path="/" element={<HomePage />} />
          
          {/* Landing page - marketing page */}
          <Route path="/landing" element={<LandingPage />} />
          
          {/* Dashboard route - displays account dashboard */}
          <Route path="/dashboard" element={<AccountDashboard />} />
          
          {/* Video player route - gated video streaming with wallet */}
          <Route path="/video-player" element={<VideoPlayer />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
