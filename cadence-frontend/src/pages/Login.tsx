import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthShell from '../components/layout/AuthShell';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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

  return (
    <AuthShell title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')}>

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