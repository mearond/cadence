import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, CalendarDays, Users, Trash2 } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import DateDisplay from '../components/shared/DateDisplay';
import DateBlock from '../components/shared/DateBlock';
import PageHeader from '../components/shared/PageHeader';
import { fetchEvents, deleteEvent, type Event } from '../lib/events';
import { useCan } from '../lib/permissions';

const statusColors: Record<string, string> = {
  planning: 'bg-gold-light/45 text-[#7a5a14]',
  confirmed: 'bg-sage-light text-teal-deep',
  'in-progress': 'bg-teal-deep text-white',
  completed: 'bg-teal-dark text-sage-light',
  cancelled: 'bg-teal-dark/[0.07] text-teal-dark/50',
};

export default function Events() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const can = useCan();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch(() => setError('Could not load events.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (e: React.MouseEvent, eventId: number) => {
    e.stopPropagation();
    if (!confirm('Delete this event? This cannot be undone.')) return;
    try {
      await deleteEvent(eventId);
      setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
    } catch {
      setError('Could not delete the event. Please try again.');
    }
  };

  const filters = ['all', 'planning', 'confirmed', 'in-progress', 'completed', 'cancelled'];
  const counts = events.reduce<Record<string, number>>((acc, ev) => {
    acc[ev.status] = (acc[ev.status] ?? 0) + 1;
    return acc;
  }, {});
  const visible = filter === 'all' ? events : events.filter((ev) => ev.status === filter);

  return (
    <DashboardLayout>
      <PageHeader
        title={t('eventsPage.title')}
        subtitle={!loading && t('dashboard.totalEvents', { count: events.length })}
        action={
          can('events:create') && (
            <button onClick={() => navigate('/events/new')} className="btn-gold">
              <Plus size={16} />
              {t('eventsPage.newEvent')}
            </button>
          )
        }
      />

      {events.length > 0 && (
        <div role="tablist" className="flex gap-1.5 mb-6 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
          {filters.map((f) => {
            const active = filter === f;
            const n = f === 'all' ? events.length : counts[f] ?? 0;
            return (
              <button
                key={f}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f)}
                className={`relative shrink-0 h-9 px-4 rounded-full text-sm font-medium transition-colors ${
                  active ? 'text-white' : 'text-teal-dark/60 hover:text-teal-dark bg-teal-dark/[0.05]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="events-filter"
                    className="absolute inset-0 rounded-full bg-teal-deep"
                    transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                  />
                )}
                <span className="relative">
                  {f === 'all' ? t('eventsPage.all') : t(`eventsPage.status.${f}`)}
                  <span className={`ml-1.5 ${active ? 'text-white/60' : 'text-teal-dark/35'}`}>{n}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-44" />
          ))}
        </div>
      )}
      {error && <p className="card p-4 mb-4 text-sm text-terracotta">{error}</p>}

      {!loading && events.length === 0 && (
        <div className="card p-12 text-center max-w-lg mx-auto">
          <div className="grid place-items-center w-14 h-14 rounded-2xl bg-sage-light text-teal-deep mx-auto mb-4">
            <CalendarDays size={26} />
          </div>
          <p className="font-display text-xl font-semibold mb-2">{t('eventsPage.emptyTitle')}</p>
          <p className="text-sm text-teal-dark/60 mb-6">{t('eventsPage.noEvents')}</p>
          {can('events:create') && (
            <button onClick={() => navigate('/events/new')} className="btn-gold">
              <Plus size={16} />
              {t('eventsPage.newEvent')}
            </button>
          )}
        </div>
      )}

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((event, i) => {
            const displayName = i18n.language === 'am' && event.name_am ? event.name_am : event.name;
            const multiDay = event.end_date && event.end_date !== event.start_date;
            return (
              // A div, not a button: the card contains the delete button, and a button inside a button is invalid HTML.
              <motion.div
                key={event.id}
                layout
                role="button"
                tabIndex={0}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.4, delay: Math.min(i, 8) * 0.05, ease: [0.22, 1, 0.36, 1] } }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                onClick={() => navigate(`/events/${event.id}`)}
                onKeyDown={(e) => {
                  if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    navigate(`/events/${event.id}`);
                  }
                }}
                className="card-interactive group relative p-5 flex flex-col gap-5 text-left"
              >
                <div className="flex items-start gap-4">
                  <DateBlock iso={event.start_date} />
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-[13px] text-teal-dark/50 mb-1">{t(`eventsPage.type.${event.event_type}`)}</p>
                    <h3 className="font-display text-lg font-semibold leading-snug text-teal-dark break-words">{displayName}</h3>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-teal-dark/[0.07]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`chip ${statusColors[event.status] || ''}`}>{t(`eventsPage.status.${event.status}`)}</span>
                    {event.guest_count != null && event.guest_count > 0 && (
                      <span className="flex items-center gap-1 text-[13px] text-teal-dark/55 truncate">
                        <Users size={13} />
                        {event.guest_count}
                      </span>
                    )}
                    {multiDay && (
                      <span className="text-[13px] text-teal-dark/45 truncate">
                        · <DateDisplay iso={event.end_date} />
                      </span>
                    )}
                  </div>
                  {can('events:delete') && (
                    <button
                      onClick={(e) => handleDelete(e, event.id)}
                      className="icon-btn-danger w-8 h-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 transition-opacity"
                      aria-label={t('eventsPage.delete')}
                      title={t('eventsPage.delete')}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
}
