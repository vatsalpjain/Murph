import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, BACKEND_URL } from '../utils/api';

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
  authModalMode: 'login' | 'signup';
  setAuthModalMode: (mode: 'login' | 'signup') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();

  // Initialize auth state - Restore session from localStorage if valid
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedSession = localStorage.getItem('session');
        
        if (storedUser && storedSession) {
          const user = JSON.parse(storedUser);
          const session = JSON.parse(storedSession);
          
          // Verify token is still valid with backend
          const response = await fetch(`${BACKEND_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            // Token is valid, restore session
            setUser(user);
            setSession(session);
          } else {
            // Token invalid or expired, clear storage
            localStorage.removeItem('user');
            localStorage.removeItem('session');
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('session');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login with email/password
  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', 
        { email, password },
        { requiresAuth: false }
      );

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
      navigate('/');
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
      const response = await apiClient.post('/auth/signup',
        { email, password, name, role },
        { requiresAuth: false }
      );

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
      navigate('/');
    } catch (error) {
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Call backend to invalidate session
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if backend call fails
    } finally {
      // Clear state
      setUser(null);
      setSession(null);
      localStorage.removeItem('user');
      localStorage.removeItem('session');

      // Navigate to landing page
      navigate('/landing');
    }
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
    authModalMode,
    setAuthModalMode,
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
