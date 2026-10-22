import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthShell from '../components/layout/AuthShell';
import { useAuthStore } from '../store/authStore';

export default function SetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const changePassword = useAuthStore((s) => s.changePassword);
  const user = useAuthStore((s) => s.user);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError(t('setPassword.tooShort'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('setPassword.mismatch'));
      return;
    }

    setLoading(true);
    const result = await changePassword(password);
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Something went wrong.');
      return;
    }

    navigate(user?.role === 'client' ? '/portal' : '/dashboard');
  };

  return (
    <AuthShell title={t('setPassword.title')} subtitle={t('setPassword.subtitle')}>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="field-label">{t('setPassword.newPassword')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input py-3"
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="field-label">{t('setPassword.confirmPassword')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input py-3"
              required
              minLength={8}
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
            {loading ? '...' : t('setPassword.save')}
          </button>
        </form>
    </AuthShell>
  );
}