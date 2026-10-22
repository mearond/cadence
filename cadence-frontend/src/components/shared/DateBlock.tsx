import { useTranslation } from 'react-i18next';
import { ethiopianDateParts } from '../../lib/today';

// A tear-off calendar leaf: the day large, the month above it. Shows the
// Ethiopian date when the app is in Amharic, the Gregorian date otherwise.
export default function DateBlock({ iso, tone = 'light' }: { iso: string; tone?: 'light' | 'dark' }) {
  const { i18n } = useTranslation();
  const isAm = i18n.language === 'am';
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  const eth = ethiopianDateParts(iso.slice(0, 10), i18n.language);
  const month = isAm ? eth.month : d.toLocaleDateString('en-US', { month: 'short' });
  const day = isAm ? eth.day : d.getDate();

  return (
    <div
      className={`w-14 shrink-0 overflow-hidden rounded-xl text-center ${
        tone === 'dark' ? 'bg-white/10 text-white' : 'bg-white border border-teal-dark/10 text-teal-dark'
      }`}
    >
      <div className={`text-[11px] font-semibold py-1 ${tone === 'dark' ? 'bg-gold text-teal-ink' : 'bg-teal-deep text-gold-light'}`}>
        {month}
      </div>
      <div className="font-display text-2xl font-semibold leading-none py-2">{day}</div>
    </div>
  );
}
