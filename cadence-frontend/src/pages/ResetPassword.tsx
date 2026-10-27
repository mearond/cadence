import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import AuthShell from '../components/layout/AuthShell';
import api from '../lib/api';

export default function ResetPassword() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) return setError(t('reset.tooShort'));
    if (password !== confirm) return setError(t('reset.mismatch'));
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setDone(true);
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.error || t('reset.failed') : t('reset.failed'));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell title={t('reset.badLinkTitle')} subtitle={t('reset.badLinkBody')}>
        <Link to="/forgot-password" className="btn-primary">{t('reset.requestNew')}</Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title={t('reset.doneTitle')}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-sage p-5 flex gap-4 items-center mb-8"
        >
          <CheckCircle2 size={26} className="text-teal-deep shrink-0" />
          <p className="text-[15px] text-teal-dark/80">{t('reset.doneBody')}</p>
        </motion.div>
        <Link to="/login" className="btn-primary w-full py-3 text-[15px]">{t('auth.signIn')}</Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t('reset.title')} subtitle={t('reset.subtitle')}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="field-label">{t('setPassword.newPassword')}</label>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input py-3"
            minLength={8}
            required
            autoFocus
          />
        </div>
        <div>
          <label className="field-label">{t('setPassword.confirmPassword')}</label>
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="input py-3"
            minLength={8}
            required
          />
        </div>
        {error && (
          <div role="alert" className="text-sm text-terracotta bg-terracotta-light/70 rounded-xl px-3.5 py-2.5">
            {error}
            {/expired|already used/i.test(error) && (
              <Link to="/forgot-password" className="block mt-1 font-semibold underline underline-offset-4">
                {t('reset.requestNew')}
              </Link>
            )}
          </div>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-[15px] mt-2">
          {loading ? '...' : t('reset.save')}
        </button>
      </form>
    </AuthShell>
  );
}
