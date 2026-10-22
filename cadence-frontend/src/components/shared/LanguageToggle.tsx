import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

// Two-position switch between English and Amharic; the gold thumb slides to the active language.
export default function LanguageToggle({ dark = false }: { dark?: boolean }) {
  const { i18n } = useTranslation();
  const current = i18n.language === 'am' ? 'am' : 'en';

  const setLanguage = (lang: 'en' | 'am') => {
    if (lang === current) return;
    i18n.changeLanguage(lang);
    try {
      localStorage.setItem('cadence_lang', lang);
    } catch {
      // storage unavailable: language resets on reload
    }
  };

  const options = [
    { value: 'en' as const, label: 'EN' },
    { value: 'am' as const, label: 'አማ' },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Language"
      className={`relative flex p-1 rounded-full text-xs font-semibold ${dark ? 'bg-white/10' : 'bg-teal-dark/[0.06]'}`}
    >
      {options.map((o) => {
        const active = o.value === current;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            onClick={() => setLanguage(o.value)}
            className={`relative w-11 h-7 rounded-full transition-colors ${
              active ? 'text-teal-ink' : dark ? 'text-white/60 hover:text-white' : 'text-teal-dark/55 hover:text-teal-dark'
            }`}
          >
            {active && (
              <motion.span
                layoutId={dark ? 'lang-thumb-dark' : 'lang-thumb'}
                className="absolute inset-0 rounded-full bg-gradient-to-b from-gold-light to-gold shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 36 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
