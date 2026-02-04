import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AccountDashboard from './pages/AccountDashboard';
import './App.css';

// Main App component - handles routing between different pages
function App() {
  return (
    <Router>
      <Routes>
        {/* Home route - displays landing page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Dashboard route - displays account dashboard */}
        <Route path="/dashboard" element={<AccountDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
