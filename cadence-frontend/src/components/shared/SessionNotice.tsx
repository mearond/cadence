import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Users, X } from 'lucide-react';

// Shown after this tab followed a sign-in made in another tab (see authStore).
export default function SessionNotice() {
  const { t } = useTranslation();
  const [name] = useState(() => {
    try {
      const value = sessionStorage.getItem('cadence_switched_to');
      sessionStorage.removeItem('cadence_switched_to');
      return value;
    } catch {
      return null;
    }
  });
  const [open, setOpen] = useState(!!name);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => setOpen(false), 9000);
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <AnimatePresence>
      {open && name && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(520px,calc(100%-2rem))] flex items-start gap-3 rounded-2xl bg-teal-ink text-white px-4 py-3 shadow-[0_18px_40px_-16px_rgb(10_40_38/0.8)]"
        >
          <Users size={18} className="text-gold-light shrink-0 mt-0.5" />
          <p className="flex-1 text-sm leading-relaxed">
            <span className="font-semibold">{t('session.switchedTitle', { name })}</span>{' '}
            <span className="text-white/70">{t('session.switchedBody')}</span>
          </p>
          <button onClick={() => setOpen(false)} className="p-1 rounded-full text-white/60 hover:text-white" aria-label={t('staffPage.dismiss')}>
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
