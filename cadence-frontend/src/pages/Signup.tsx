import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { homePathFor } from '../lib/permissions';
import { useTranslation } from 'react-i18next';
import AuthShell from '../components/layout/AuthShell';
import { useAuthStore } from '../store/authStore';
import { isValidEmail } from '../lib/validation';

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentToken = useAuthStore((st) => st.token);
  const currentUser = useAuthStore((st) => st.user);
  const signup = useAuthStore((s) => s.signup);

  const [orgName, setOrgName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError(t('auth.invalidEmail'));
      return;
    }

    setLoading(true);
    const result = await signup(orgName, name, email, password);

    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Something went wrong.');
      return;
    }
    navigate('/dashboard');
  };

  // Already signed in (in this tab or another one): go to the home page instead.
  if (currentToken && currentUser && !currentUser.mustChangePassword) {
    return <Navigate to={homePathFor(currentUser.role)} replace />;
  }

  return (
    <AuthShell title={t('auth.signupTitle')} subtitle={t('auth.signupSubtitle')}>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="field-label">{t('auth.orgName')}</label>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="input py-3"
              required
            />
          </div>
          <div>
            <label className="field-label">{t('auth.name')}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input py-3"
              required
            />
          </div>
          <div>
            <label className="field-label">{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input py-3"
              required
            />
          </div>
          <div>
            <label className="field-label">{t('auth.password')}</label>
            <input
              type="password"
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
            {loading ? '...' : t('auth.createAccount')}
          </button>
        </form>

        <p className="text-sm text-teal-dark/60 text-center mt-8">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="font-semibold text-teal-deep underline decoration-gold/60 decoration-2 underline-offset-4 hover:decoration-gold">
            {t('auth.signInLink')}
          </Link>
        </p>
    </AuthShell>
  );
}