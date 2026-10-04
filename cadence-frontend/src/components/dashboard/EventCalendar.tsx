import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  toEthiopian,
  ethiopianToGregorian,
  daysInEthiopianMonth,
  ETHIOPIAN_MONTHS_AM,
} from '../../lib/ethiopianCalendar';

interface CalendarEvent {
  id: number;
  name: string;
  name_am: string | null;
  start_date: string;
  status: string;
}

const dotColors: Record<string, string> = {
  planning: 'bg-gold',
  confirmed: 'bg-sage',
  'in-progress': 'bg-teal-deep',
  completed: 'bg-teal-dark',
  cancelled: 'bg-red-400',
};

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toEthKey(year: number, month: number, day: number): string {
  return `eth-${year}-${month}-${day}`;
}

function addLocalDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

// Converts a UTC-anchored Date (from ethiopianToGregorian) into the equivalent
// local-midnight Date, so grid math stays consistent with the rest of the component.
function utcToLocalCalendarDate(d: Date): Date {
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

interface CalendarCell {
  key: string;
  gregDate: Date;
  ethDay: number;
  inMonth: boolean;
  dayEvents: CalendarEvent[];
  isToday: boolean;
}

export default function EventCalendar({ events }: { events: CalendarEvent[] }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAmharic = i18n.language === 'am';

  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const eventsByGregDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      if (!ev.start_date) continue;
      const key = ev.start_date.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(ev);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const eventsByEthDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      if (!ev.start_date) continue;
      const e = toEthiopian(ev.start_date);
      const key = toEthKey(e.year, e.month, e.day);
      const list = map.get(key) ?? [];
      list.push(ev);
      map.set(key, list);
    }
    return map;
  }, [events]);

  // Which Ethiopian year/month the cursor currently falls in (only meaningful in Amharic mode).
  const cursorEth = useMemo(() => toEthiopian(toDateKey(cursor)), [cursor]);
  const todayKey = toDateKey(new Date());
  const todayEth = useMemo(() => toEthiopian(todayKey), [todayKey]);

  const monthLabel = isAmharic
    ? `${ETHIOPIAN_MONTHS_AM[cursorEth.month - 1]} ${cursorEth.year}`
    : cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const weekDayLabels = useMemo(() => {
    const base = new Date(2024, 0, 7); // a Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d.toLocaleDateString(isAmharic ? 'am-ET' : 'en-US', { weekday: 'short' });
    });
  }, [isAmharic]);

  const cells = useMemo<CalendarCell[]>(() => {
    let gridStart: Date;
    let gridEnd: Date;

    if (isAmharic) {
      const daysInMonth = daysInEthiopianMonth(cursorEth.year, cursorEth.month);
      const localStart = utcToLocalCalendarDate(ethiopianToGregorian(cursorEth.year, cursorEth.month, 1));
      const localEnd = addLocalDays(localStart, daysInMonth - 1);
      gridStart = addLocalDays(localStart, -localStart.getDay());
      gridEnd = addLocalDays(localEnd, 6 - localEnd.getDay());
    } else {
      const year = cursor.getFullYear();
      const month = cursor.getMonth();
      const firstOfMonth = new Date(year, month, 1);
      const lastOfMonth = new Date(year, month + 1, 0);
      gridStart = addLocalDays(firstOfMonth, -firstOfMonth.getDay());
      gridEnd = addLocalDays(lastOfMonth, 6 - lastOfMonth.getDay());
    }

    const result: CalendarCell[] = [];
    let date = gridStart;
    while (date <= gridEnd) {
      const gregKey = toDateKey(date);
      const eth = toEthiopian(gregKey);
      const inMonth = isAmharic
        ? eth.year === cursorEth.year && eth.month === cursorEth.month
        : date.getMonth() === cursor.getMonth() && date.getFullYear() === cursor.getFullYear();
      const ethKey = toEthKey(eth.year, eth.month, eth.day);
      const dayEvents = isAmharic ? eventsByEthDay.get(ethKey) ?? [] : eventsByGregDay.get(gregKey) ?? [];
      const isToday = isAmharic
        ? eth.year === todayEth.year && eth.month === todayEth.month && eth.day === todayEth.day
        : gregKey === todayKey;

      result.push({
        key: isAmharic ? ethKey : gregKey,
        gregDate: date,
        ethDay: eth.day,
        inMonth,
        dayEvents,
        isToday,
      });
      date = addLocalDays(date, 1);
    }
    return result;
  }, [isAmharic, cursor, cursorEth, eventsByGregDay, eventsByEthDay, todayEth, todayKey]);

  const goToPreviousMonth = () => {
    if (isAmharic) {
      let m = cursorEth.month - 1;
      let y = cursorEth.year;
      if (m < 1) {
        m = 13;
        y -= 1;
      }
      setCursor(utcToLocalCalendarDate(ethiopianToGregorian(y, m, 1)));
    } else {
      setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
    }
    setSelectedKey(null);
  };

  const goToNextMonth = () => {
    if (isAmharic) {
      let m = cursorEth.month + 1;
      let y = cursorEth.year;
      if (m > 13) {
        m = 1;
        y += 1;
      }
      setCursor(utcToLocalCalendarDate(ethiopianToGregorian(y, m, 1)));
    } else {
      setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
    }
    setSelectedKey(null);
  };

  const selectedCell = selectedKey ? cells.find((c) => c.key === selectedKey) : null;
  const selectedEvents = selectedCell?.dayEvents ?? [];

  return (
    <div className="bg-white rounded-2xl border border-sage/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-teal-dark/60 uppercase tracking-wide">{t('dashboard.calendar')}</h2>
        <div className="flex items-center gap-2">
          <button onClick={goToPreviousMonth} className="p-1.5 rounded-full hover:bg-sage-light text-teal-dark/60">
            <ChevronLeft size={15} />
          </button>
          <p className="text-sm font-semibold text-teal-dark w-32 text-center capitalize">{monthLabel}</p>
          <button onClick={goToNextMonth} className="p-1.5 rounded-full hover:bg-sage-light text-teal-dark/60">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {weekDayLabels.map((label) => (
          <div key={label} className="text-center text-[11px] font-semibold text-teal-dark/40 py-1.5 uppercase">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const isSelected = cell.key === selectedKey;
          const bigLabel = isAmharic ? cell.ethDay : cell.gregDate.getDate();
          const smallLabel = isAmharic ? cell.gregDate.getDate() : cell.ethDay;

          return (
            <button
              key={cell.key}
              onClick={() => setSelectedKey(cell.dayEvents.length > 0 ? cell.key : null)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
                !cell.inMonth ? 'text-teal-dark/20' : 'text-teal-dark'
              } ${
                isSelected
                  ? 'bg-teal-deep text-white'
                  : cell.isToday
                  ? 'bg-gold-light/40'
                  : cell.dayEvents.length > 0
                  ? 'hover:bg-sage-light'
                  : ''
              }`}
            >
              <span className={cell.isToday && !isSelected ? 'font-bold' : ''}>{bigLabel}</span>
              <span className={`text-[9px] leading-none ${isSelected ? 'text-white/70' : 'text-teal-dark/35'}`}>
                {smallLabel}
              </span>
              {cell.dayEvents.length > 0 && (
                <span className="flex items-center gap-0.5">
                  {cell.dayEvents.slice(0, 3).map((ev) => (
                    <span
                      key={ev.id}
                      className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : dotColors[ev.status] || 'bg-gold'}`}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedEvents.length > 0 && (
        <div className="mt-4 pt-4 border-t border-sage/20 space-y-1.5">
          {selectedEvents.map((ev) => {
            const displayName = i18n.language === 'am' && ev.name_am ? ev.name_am : ev.name;
            return (
              <button
                key={ev.id}
                onClick={() => navigate(`/events/${ev.id}`)}
                className="w-full flex items-center gap-2 text-left text-sm text-teal-dark hover:text-teal-deep px-2 py-1.5 rounded-lg hover:bg-sage-light/60"
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[ev.status] || 'bg-gold'}`} />
                {displayName}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}