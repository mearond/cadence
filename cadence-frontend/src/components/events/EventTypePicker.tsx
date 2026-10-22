import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Presentation, Heart, Briefcase, GraduationCap, Church, Flower2, Sparkles } from 'lucide-react';
import { EVENT_TYPES } from '../../lib/events';

const ICONS: Record<string, typeof Heart> = {
  conference: Presentation,
  wedding: Heart,
  corporate: Briefcase,
  graduation: GraduationCap,
  religious: Church,
  memorial: Flower2,
  other: Sparkles,
};

// Event type as a row of tiles rather than a dropdown, so every option is visible at once.
export default function EventTypePicker({ value, onChange }: { value: string; onChange: (type: string) => void }) {
  const { t } = useTranslation();
  return (
    <div role="radiogroup" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {EVENT_TYPES.map((type) => {
        const Icon = ICONS[type] ?? Sparkles;
        const active = value === type;
        return (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(type)}
            className={`relative flex items-center gap-2.5 h-12 px-3.5 rounded-xl text-sm font-medium border transition-colors ${
              active
                ? 'text-white border-transparent'
                : 'bg-white border-teal-dark/12 text-teal-dark/75 hover:border-teal-dark/30 hover:text-teal-dark'
            }`}
          >
            {active && (
              <motion.span
                layoutId="event-type-active"
                className="absolute inset-0 rounded-xl bg-teal-deep"
                transition={{ type: 'spring', stiffness: 480, damping: 36 }}
              />
            )}
            <Icon size={17} className={`relative shrink-0 ${active ? 'text-gold-light' : 'text-teal-deep/70'}`} />
            <span className="relative truncate">{t(`eventsPage.type.${type}`)}</span>
          </button>
        );
      })}
    </div>
  );
}
