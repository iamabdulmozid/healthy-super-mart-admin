// src/routes/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermissions?: string[];
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  requiredPermissions = []
}: ProtectedRouteProps) {
  const { isAuthenticated, admin, loading, hasRole, hasPermission } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !admin) {
    return <Navigate to="/login" replace />;
  }

  // Check required role
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check required permissions
  for (const permission of requiredPermissions) {
    if (!hasPermission(permission)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}