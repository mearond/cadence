import { useTranslation } from 'react-i18next';
import { ethiopianDateParts } from '../../lib/today';

// A tear-off calendar leaf: the day large, the month above it. Shows the
// Ethiopian date when the app is in Amharic, the Gregorian date otherwise.
export default function DateBlock({ iso, tone = 'light', size = 'md' }: { iso: string; tone?: 'light' | 'dark'; size?: 'sm' | 'md' }) {
  const { i18n } = useTranslation();
  const isAm = i18n.language === 'am';
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  const eth = ethiopianDateParts(iso.slice(0, 10), i18n.language);
  const month = isAm ? eth.month : d.toLocaleDateString('en-US', { month: 'short' });
  const day = isAm ? eth.day : d.getDate();

  return (
    <div
      className={`${size === 'sm' ? 'w-11' : 'w-14'} shrink-0 overflow-hidden rounded-xl text-center ${
        tone === 'dark' ? 'bg-white/10 text-white' : 'bg-white border border-teal-dark/10 text-teal-dark'
      }`}
    >
      <div className={`${size === 'sm' ? 'text-[10px] py-0.5' : 'text-[11px] py-1'} font-semibold ${tone === 'dark' ? 'bg-gold text-teal-ink' : 'bg-teal-deep text-gold-light'}`}>
        {month}
      </div>
      <div className={`font-display font-semibold leading-none ${size === 'sm' ? 'text-lg py-1.5' : 'text-2xl py-2'}`}>{day}</div>
    </div>
  );
}
