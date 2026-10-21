import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { can, homePathFor, type Permission } from '../lib/permissions';

const KNOWN_ROLES = ['owner', 'manager', 'coordinator', 'staff', 'client'];

// Refresh the saved user once per page load, not on every route change.
let refreshPromise: Promise<void> | null = null;
let refreshDone = false;

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
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();
  const [, rerender] = useState(0);

  useEffect(() => {
    if (!token) return;
    if (!refreshPromise) {
      refreshPromise = refreshUser().finally(() => {
        refreshDone = true;
      });
    }
    let active = true;
    refreshPromise.then(() => active && rerender((n) => n + 1));
    return () => {
      active = false;
    };
  }, [token, refreshUser]);

  if (!token) return <Navigate to="/login" replace />;

  if (user?.mustChangePassword && location.pathname !== '/set-password') {
    return <Navigate to="/set-password" replace />;
  }

  // A role from before the roles update (e.g. 'admin'). Wait for the refresh above;
  // if the database itself still has the old role, say so instead of a blank page.
  if (user && !KNOWN_ROLES.includes(user.role)) {
    if (!refreshDone) return null;
    return <UnknownRole role={user.role} onLogout={logout} />;
  }

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

function UnknownRole({ role, onLogout }: { role: string; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-sage/30 p-6">
        <h1 className="text-lg font-bold text-teal-dark mb-2">Your account needs updating</h1>
        <p className="text-sm text-teal-dark/70 mb-3">
          This account has the role <strong>"{role}"</strong>, which Cadence no longer uses. The database
          migrations that convert old roles (admin becomes owner) probably haven't been run yet.
        </p>
        <p className="text-sm text-teal-dark/70 mb-5">
          In the <code className="bg-sage-light/60 px-1 rounded">cadence-backend</code> folder, run{' '}
          <code className="bg-sage-light/60 px-1 rounded">npm run migrate</code>, restart the backend, then sign in again.
        </p>
        <button
          onClick={onLogout}
          className="bg-teal-deep text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-teal-dark"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
