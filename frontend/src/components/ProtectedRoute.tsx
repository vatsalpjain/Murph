import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface RouteGuardProps {
  children: ReactNode;
}

interface RoleRouteGuardProps {
  children: ReactNode;
  allowedRoles: ('student' | 'teacher')[];
}

/**
 * Loading Spinner - Shown while checking auth state
 */
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
      <p className="text-white mt-4">Loading...</p>
    </div>
  </div>
);

/**
 * Protected Route - Only accessible when authenticated
 * Redirects to / (landing) if user is not logged in
 */
export const ProtectedRoute = ({ children }: RouteGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Not logged in → redirect to landing
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

/**
 * Role-Protected Route - Only accessible for specific user roles
 * Redirects to /home if user doesn't have the required role
 */
export const RoleProtectedRoute = ({ children, allowedRoles }: RoleRouteGuardProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Not logged in → redirect to landing
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check if user's role is in the allowed roles
  if (!user?.role || !allowedRoles.includes(user.role)) {
    // Wrong role → redirect to home with their appropriate dashboard
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

/**
 * Public Only Route - Only accessible when NOT authenticated
 * Redirects to /home if user is already logged in
 */
export const PublicOnlyRoute = ({ children }: RouteGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Already logged in → redirect to home
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};
