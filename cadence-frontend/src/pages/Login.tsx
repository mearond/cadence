import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { homePathFor } from '../lib/permissions';
import { useTranslation } from 'react-i18next';
import AuthShell from '../components/layout/AuthShell';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentToken = useAuthStore((st) => st.token);
  const currentUser = useAuthStore((st) => st.user);
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // Why the person was sent here, if they were signed out (set by lib/api.ts or authStore).
  const [signoutReason] = useState(() => {
    try {
      const reason = sessionStorage.getItem('cadence_signout_reason');
      sessionStorage.removeItem('cadence_signout_reason');
      return reason;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Something went wrong.');
      return;
    }

    const loggedInUser = useAuthStore.getState().user;
    if (loggedInUser?.mustChangePassword) {
      navigate('/set-password');
    } else {
      navigate(loggedInUser?.role === 'client' ? '/portal' : '/dashboard');
    }
  };

  // Already signed in (in this tab or another one): go to the home page instead.
  if (currentToken && currentUser && !currentUser.mustChangePassword) {
    return <Navigate to={homePathFor(currentUser.role)} replace />;
  }

  return (
    <AuthShell title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')}>

        {signoutReason && (
        <div
          role="status"
          className={`mb-6 rounded-2xl border px-4 py-3 text-sm leading-relaxed ${
            signoutReason === 'removed'
              ? 'border-terracotta/25 bg-terracotta-light/60 text-[#7d3418]'
              : 'border-teal-deep/15 bg-sage-light/70 text-teal-dark'
          }`}
        >
          {t(`session.reason.${signoutReason}`, { defaultValue: t('session.reason.expired') })}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="field-label">{t('auth.email')}</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input py-3"
              required
            />
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <label className="field-label">{t('auth.password')}</label>
              <Link to="/forgot-password" className="text-[13px] font-medium text-teal-deep hover:text-teal-dark underline-offset-4 hover:underline">
                {t('auth.forgotLink')}
              </Link>
            </div>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input py-3"
              required
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-terracotta bg-terracotta-light/70 rounded-xl px-3.5 py-2.5">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-[15px] mt-2"
          >
            {loading ? '...' : t('auth.signIn')}
          </button>
        </form>

        <p className="text-sm text-teal-dark/60 text-center mt-8">
          {t('auth.noAccount')}{' '}
          <Link to="/signup" className="font-semibold text-teal-deep underline decoration-gold/60 decoration-2 underline-offset-4 hover:decoration-gold">
            {t('auth.signUpLink')}
          </Link>
        </p>
    </AuthShell>
  );
}