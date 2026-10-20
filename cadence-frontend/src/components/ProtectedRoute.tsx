import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { can, homePathFor, type Permission } from '../lib/permissions';

const KNOWN_ROLES = ['owner', 'manager', 'coordinator', 'staff', 'client'];

// Refresh the saved user once per page load, not on every route change.
let refreshedThisLoad = false;

interface Props {
  children: ReactNode;
  // Who may open this page. Clients only see the portal; staff never see it.
  audience?: 'staff' | 'client' | 'any';
  // Staff pages that only some roles can use, e.g. 'staff:view'.
  permission?: Permission;
}

export default function ProtectedRoute({ children, audience = 'staff', permission }: Props) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const location = useLocation();

  useEffect(() => {
    if (token && !refreshedThisLoad) {
      refreshedThisLoad = true;
      refreshUser().then(() => {
        // Still an unknown role (server unreachable, say): sign in again rather than show a blank page.
        const { user: current, logout } = useAuthStore.getState();
        if (current && !KNOWN_ROLES.includes(current.role)) logout();
      });
    }
  }, [token, refreshUser]);

  if (!token) return <Navigate to="/login" replace />;

  if (user?.mustChangePassword && location.pathname !== '/set-password') {
    return <Navigate to="/set-password" replace />;
  }

  // A role saved before the roles update (e.g. 'admin') is unknown here; wait for
  // the refresh above to replace it rather than redirecting on the stale value.
  if (user && !KNOWN_ROLES.includes(user.role)) return null;

  const isClient = user?.role === 'client';
  if ((audience === 'staff' && isClient) || (audience === 'client' && user && !isClient)) {
    return <Navigate to={homePathFor(user?.role)} replace />;
  }
  if (permission && !can(user?.role, permission)) {
    return <Navigate to={homePathFor(user?.role)} replace />;
  }

  return <>{children}</>;
}

// "/" and unknown addresses: send people to their home page, or to login.
export function HomeRedirect() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  if (!token) return <Navigate to="/login" replace />;
  return <Navigate to={homePathFor(user?.role)} replace />;
}
