import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-xl font-bold text-slate-900 mb-1">{t('setPassword.title')}</h1>
        <p className="text-sm text-slate-500 mb-5">{t('setPassword.subtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">{t('setPassword.newPassword')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm"
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">{t('setPassword.confirmPassword')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm"
              required
              minLength={8}
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '...' : t('setPassword.save')}
          </button>
        </form>
      </div>
    </div>
  );
}