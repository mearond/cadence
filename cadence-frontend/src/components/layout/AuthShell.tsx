import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Tilet from '../shared/Tilet';
import AuthArt from './AuthArt';
import LanguageToggle from '../shared/LanguageToggle';
import { todayInBothCalendars } from '../../lib/today';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}


// Sign in, sign up and set password: an ink panel woven with tilet bands beside the form.
export default function AuthShell({ title, subtitle, children }: Props) {
  const { t, i18n } = useTranslation();
  const today = todayInBothCalendars(i18n.language);

  return (
    <div className="min-h-screen grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] bg-cream">
      {/* Brand panel */}
      <aside className="relative hidden lg:flex flex-col h-screen sticky top-0 overflow-hidden bg-teal-ink text-white px-10 xl:px-14 py-9">
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

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="relative mt-[clamp(1.25rem,4vh,3rem)] font-display text-[clamp(1.9rem,2.6vw,2.9rem)] leading-[1.05] font-semibold text-gold-light max-w-[16ch]"
        >
          {t('authPanel.headline')}
        </motion.h1>

        {/* The artwork takes whatever height is left, as a square, so it never runs into the bands. */}
        <div className="relative flex-1 min-h-0 flex items-center justify-center py-[clamp(0.75rem,3vh,2rem)]">
          <div className="h-full max-h-[480px] aspect-square max-w-full">
            <AuthArt />
          </div>
        </div>

        <div className="relative">
          <div className="space-y-1.5 mb-6 -mx-10 xl:-mx-14">
            <Tilet size={14} tone="gold" weave />
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
