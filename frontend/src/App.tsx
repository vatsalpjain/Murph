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
          {/* Home route - displays landing page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Home page - main app page after login */}
          <Route path="/home" element={<HomePage />} />
          
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
