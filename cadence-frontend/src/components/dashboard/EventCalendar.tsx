import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

export default function EventCalendar({ events }: { events: CalendarEvent[] }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const eventsByDay = useMemo(() => {
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

  const monthLabel = cursor.toLocaleDateString(i18n.language === 'am' ? 'am-ET' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  const weekDayLabels = useMemo(() => {
    const base = new Date(2024, 0, 7); // a Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d.toLocaleDateString(i18n.language === 'am' ? 'am-ET' : 'en-US', { weekday: 'short' });
    });
  }, [i18n.language]);

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const result: { date: Date; inMonth: boolean }[] = [];
    for (let i = 0; i < startOffset; i++) {
      const date = new Date(year, month, 1 - (startOffset - i));
      result.push({ date, inMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      result.push({ date: new Date(year, month, day), inMonth: true });
    }
    while (result.length % 7 !== 0) {
      const last = result[result.length - 1].date;
      const date = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
      result.push({ date, inMonth: false });
    }
    return result;
  }, [cursor]);

  const todayKey = toDateKey(new Date());
  const selectedEvents = selectedKey ? eventsByDay.get(selectedKey) ?? [] : [];

  return (
    <div className="bg-white rounded-2xl border border-sage/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-teal-dark/60 uppercase tracking-wide">{t('dashboard.calendar')}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="p-1.5 rounded-full hover:bg-sage-light text-teal-dark/60"
          >
            <ChevronLeft size={15} />
          </button>
          <p className="text-sm font-semibold text-teal-dark w-32 text-center capitalize">{monthLabel}</p>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="p-1.5 rounded-full hover:bg-sage-light text-teal-dark/60"
          >
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
        {cells.map(({ date, inMonth }) => {
          const key = toDateKey(date);
          const dayEvents = eventsByDay.get(key) ?? [];
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;

          return (
            <button
              key={key}
              onClick={() => setSelectedKey(dayEvents.length > 0 ? key : null)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
                !inMonth ? 'text-teal-dark/20' : 'text-teal-dark'
              } ${isSelected ? 'bg-teal-deep text-white' : isToday ? 'bg-gold-light/40' : dayEvents.length > 0 ? 'hover:bg-sage-light' : ''}`}
            >
              <span className={isToday && !isSelected ? 'font-bold' : ''}>{date.getDate()}</span>
              {dayEvents.length > 0 && (
                <span className="flex items-center gap-0.5">
                  {dayEvents.slice(0, 3).map((ev) => (
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