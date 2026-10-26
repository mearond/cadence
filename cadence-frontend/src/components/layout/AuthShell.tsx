import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Tilet from '../shared/Tilet';
import AuthArt from './AuthArt';
import LanguageToggle from '../shared/LanguageToggle';
import { Clock, Wallet, Stamp } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}


const rise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

const FEATURES = [
  { icon: Clock, key: 'timelines' },
  { icon: Wallet, key: 'budgets' },
  { icon: Stamp, key: 'approvals' },
];

// Sign in, sign up and set password: an ink panel woven with tilet bands beside the form.
export default function AuthShell({ title, subtitle, children }: Props) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] bg-cream">
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

        {/* Text and artwork side by side on wide screens, stacked on narrower ones. */}
        <div className="relative flex-1 min-h-0 grid grid-rows-[auto_minmax(0,1fr)] xl:grid-rows-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-x-10 gap-y-4 py-[clamp(1rem,4vh,2.5rem)]">
          <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.12, delayChildren: 0.1 }}
            className="max-w-xl"
          >
            <motion.h1
              variants={rise}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[clamp(2.3rem,3.3vw,3.75rem)] leading-[1.02] font-semibold text-gold-light"
            >
              {t('authPanel.headline')}
            </motion.h1>
            <motion.p
              variants={rise}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 text-[clamp(1rem,1.15vw,1.2rem)] leading-relaxed text-white/70 max-w-[40ch]"
            >
              {t('authPanel.body')}
            </motion.p>
            <motion.ul variants={rise} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="mt-6 flex flex-wrap gap-2">
              {FEATURES.map(({ icon: Icon, key }) => (
                <li
                  key={key}
                  className="flex items-center gap-2 rounded-full border border-gold/30 bg-white/[0.04] pl-2.5 pr-3.5 py-1.5 text-sm text-white/85"
                >
                  <Icon size={15} className="text-gold-light" />
                  {t(`authPanel.features.${key}`)}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          {/* The artwork takes the space left (as a square), so it never runs into the bands. */}
          <div className="h-full min-h-0 flex items-center justify-center">
            {/* Always a square: the smaller of the space's width and height (capped),
                so the cards keep their places around the diamond on any screen. */}
            <div className="w-full h-full [container-type:size] grid place-items-center">
              <div className="w-[min(100cqw,100cqh,420px)] aspect-square">
                <AuthArt />
              </div>
            </div>
          </div>
        </div>

        {/* A single slim woven band across the foot of the panel, kept quiet. */}
        <div className="relative -mx-10 xl:-mx-14 -mb-9 pb-9 space-y-1.5 opacity-80">
          <Tilet size={10} tone="gold" weave />
          <div style={{ animationDelay: '0.2s' }} className="tilet-weave">
            <Tilet size={5} tone="teal" />
          </div>
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
