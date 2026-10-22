import { useTranslation } from 'react-i18next';
import CountUp from './CountUp';

function daysUntil(iso: string): number {
  const start = new Date(`${iso.slice(0, 10)}T00:00:00`);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((start.getTime() - today.getTime()) / 86400000);
}

// "12 days to go" for the client: the number they care about most.
export default function Countdown({ startDate, status }: { startDate: string; status: string }) {
  const { t } = useTranslation();
  if (status === 'cancelled') return null;

  if (status === 'in-progress') {
    return (
      <div className="sm:text-right">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold">
          <span className="relative flex w-2.5 h-2.5">
            <span className="absolute inset-0 rounded-full bg-gold-light animate-ping opacity-75" />
            <span className="relative w-2.5 h-2.5 rounded-full bg-gold-light" />
          </span>
          {t('portal.happeningNow')}
        </span>
      </div>
    );
  }

  const days = daysUntil(startDate);
  if (status === 'completed' || days < 0) return null;

  return (
    <div className="sm:text-right">
      <p className="font-display text-6xl font-semibold leading-none text-gold-light tabular-nums">
        <CountUp value={days} duration={1.4} />
      </p>
      <p className="text-sm text-white/65 mt-1.5">{days === 0 ? t('portal.today') : t('portal.daysToGo', { count: days })}</p>
    </div>
  );
}
