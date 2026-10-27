import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MailCheck } from 'lucide-react';
import AuthShell from '../components/layout/AuthShell';
import api from '../lib/api';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data?.error || t('forgot.failed') : t('forgot.failed'));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthShell title={t('forgot.sentTitle')}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-sage p-5 flex gap-4 items-start"
        >
          <span className="icon-tile w-10 h-10 bg-paper">
            <MailCheck size={20} />
          </span>
          <p className="text-[15px] leading-relaxed text-teal-dark/80">{t('forgot.sentBody', { email: email.trim() })}</p>
        </motion.div>
        <p className="text-sm text-teal-dark/60 mt-6">{t('forgot.checkSpam')}</p>
        <div className="flex flex-wrap gap-3 mt-8">
          <Link to="/login" className="btn-primary">{t('forgot.backToSignIn')}</Link>
          <button onClick={() => setSent(false)} className="btn-ghost">{t('forgot.tryAgain')}</button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t('forgot.title')} subtitle={t('forgot.subtitle')}>
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
            autoFocus
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-terracotta bg-terracotta-light/70 rounded-xl px-3.5 py-2.5">{error}</p>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-[15px] mt-2">
          {loading ? '...' : t('forgot.send')}
        </button>
      </form>
      <p className="text-sm text-teal-dark/60 text-center mt-8">
        <Link to="/login" className="font-semibold text-teal-deep underline decoration-gold/60 decoration-2 underline-offset-4 hover:decoration-gold">
          {t('forgot.backToSignIn')}
        </Link>
      </p>
    </AuthShell>
  );
}
