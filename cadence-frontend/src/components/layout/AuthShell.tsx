import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Tilet from '../shared/Tilet';
import LanguageToggle from '../shared/LanguageToggle';
import { todayInBothCalendars } from '../../lib/today';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const rise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

// Sign in, sign up and set password: an ink panel woven with tilet bands beside the form.
export default function AuthShell({ title, subtitle, children }: Props) {
  const { t, i18n } = useTranslation();
  const today = todayInBothCalendars(i18n.language);

  return (
    <div className="min-h-screen grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] bg-cream">
      {/* Brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-teal-ink text-white p-12 xl:p-16">
        <div
          className="absolute inset-0 opacity-[0.55] pointer-events-none"
          style={{
            background:
              'radial-gradient(60% 50% at 85% 10%, rgb(19 95 90 / 0.9), transparent 70%), radial-gradient(50% 40% at 0% 100%, rgb(196 144 45 / 0.25), transparent 70%)',
          }}
        />
        <div className="relative flex items-center gap-3">
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-gold-light to-gold text-teal-ink font-display font-bold text-xl">
            C
          </span>
          <span className="font-display font-semibold text-2xl tracking-tight">{t('app.name')}</span>
        </div>

        <motion.div
          className="relative max-w-lg"
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.12, delayChildren: 0.15 }}
        >
          <motion.h1
            variants={rise}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2.4rem,3.6vw,3.6rem)] leading-[1.02] font-semibold text-gold-light"
          >
            {t('authPanel.headline')}
          </motion.h1>
          <motion.p
            variants={rise}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-lg leading-relaxed text-white/70 max-w-md"
          >
            {t('authPanel.body')}
          </motion.p>
        </motion.div>

        <div className="relative">
          <div className="space-y-2 mb-8 -mx-12 xl:-mx-16">
            <Tilet size={18} tone="gold" weave />
            <div style={{ animationDelay: '0.15s' }} className="tilet-weave">
              <Tilet size={12} tone="teal" />
            </div>
            <div style={{ animationDelay: '0.3s' }} className="tilet-weave">
              <Tilet size={7} tone="gold" />
            </div>
          </div>
          <p className="text-sm text-white/55">
            <span className="text-white/85 font-medium">{today.primary}</span>
            <span className="mx-2 text-white/25">/</span>
            {today.secondary}
          </p>
        </div>
      </aside>

      {/* Form */}
      <main className="relative flex flex-col min-h-screen">
        <div className="lg:hidden">
          <Tilet size={10} tone="teal" weave />
        </div>
        <div className="flex items-center justify-between px-6 sm:px-10 pt-6">
          <span className="lg:invisible font-display font-semibold text-xl text-teal-dark">{t('app.name')}</span>
          <LanguageToggle />
        </div>
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-10">
          <motion.div
            className="w-full max-w-[400px]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <h2 className="font-display text-[2rem] leading-tight font-semibold text-teal-dark">{title}</h2>
            {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-teal-dark/60">{subtitle}</p>}
            <div className="mt-8">{children}</div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
