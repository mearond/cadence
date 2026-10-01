import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!token) return <Navigate to="/login" replace />;

  if (user?.mustChangePassword && location.pathname !== '/set-password') {
    return <Navigate to="/set-password" replace />;
  }

  return <>{children}</>;
}