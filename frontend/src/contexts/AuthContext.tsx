import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Authentication Context for managing user session and auth state
 * Handles login, signup, logout, and token management
 */

interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
  is_active: boolean;
  created_at: string;
  wallet_address?: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'student' | 'teacher') => Promise<void>;
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const BACKEND_URL = 'http://localhost:8000';

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedSession = localStorage.getItem('session');

    if (storedUser && storedSession) {
      setUser(JSON.parse(storedUser));
      setSession(JSON.parse(storedSession));
    }

    setIsLoading(false);
  }, []);

  // Login with email/password
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();

      // Store user and session
      setUser(data.user);
      setSession(data.session);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('session', JSON.stringify(data.session));

      // Close modal
      setShowAuthModal(false);

      // Navigate to home page after successful login
      navigate('/home');
    } catch (error) {
      throw error;
    }
  };

  // Signup with email/password
  const signup = async (
    email: string,
    password: string,
    name: string,
    role: 'student' | 'teacher'
  ) => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Signup failed');
      }

      const data = await response.json();

      // Store user and session
      setUser(data.user);
      setSession(data.session);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('session', JSON.stringify(data.session));

      // Close modal
      setShowAuthModal(false);

      // Navigate to home page after successful signup
      navigate('/home');
    } catch (error) {
      throw error;
    }
  };

  // Logout
  const logout = () => {
    // Clear state
    setUser(null);
    setSession(null);
    localStorage.removeItem('user');
    localStorage.removeItem('session');

    // Navigate to home
    navigate('/');
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user && !!session,
    isLoading,
    login,
    signup,
    logout,
    showAuthModal,
    setShowAuthModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
