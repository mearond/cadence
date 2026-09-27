import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, CalendarDays, Users, Trash2 } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { fetchEvents, deleteEvent, type Event } from '../lib/events';

const statusColors: Record<string, string> = {
  planning: 'bg-gold-light/40 text-[#8a6a1f]',
  confirmed: 'bg-sage-light text-teal-dark',
  'in-progress': 'bg-teal-deep/10 text-teal-deep',
  completed: 'bg-sage text-white',
  cancelled: 'bg-red-100 text-red-600',
};

export default function Events() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch(() => setError('Could not load events.'))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(i18n.language === 'am' ? 'am-ET' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const handleDelete = async (e: React.MouseEvent, eventId: number) => {
    e.stopPropagation();
    if (!confirm('Delete this event? This cannot be undone.')) return;
    await deleteEvent(eventId);
    setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-teal-dark">{t('eventsPage.title')}</h1>
        <button
          onClick={() => navigate('/events/new')}
          className="flex items-center gap-2 bg-gold text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-gold/90 transition-colors shadow-sm"
        >
          <Plus size={16} />
          {t('eventsPage.newEvent')}
        </button>
      </div>

      {loading && <p className="text-sm text-teal-dark/50">...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && events.length === 0 && (
        <div className="bg-white rounded-2xl border border-sage/30 p-10 text-center">
          <CalendarDays size={28} className="mx-auto text-teal-deep/30 mb-3" />
          <p className="text-sm text-teal-dark/50">{t('eventsPage.noEvents')}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event, i) => {
          const displayName = i18n.language === 'am' && event.name_am ? event.name_am : event.name;
          return (
            <motion.button
              key={event.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() => navigate(`/events/${event.id}`)}
              className="text-left bg-white rounded-2xl border border-sage/30 p-5 hover:shadow-md hover:border-gold/40 transition-all relative group"
            >
              <button
                onClick={(e) => handleDelete(e, event.id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-teal-dark/30 hover:text-terracotta transition-all p-1"
              >
                <Trash2 size={14} />
              </button>

              <div className="flex items-center justify-between mb-3">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[event.status] || ''}`}>
                  {t(`eventsPage.status.${event.status}`)}
                </span>
                <span className="text-[11px] text-teal-dark/40 font-medium uppercase">
                  {t(`eventsPage.type.${event.event_type}`)}
                </span>
              </div>
              <h3 className="font-semibold text-teal-dark mb-2 pr-5">{displayName}</h3>
              <div className="flex items-center gap-3 text-xs text-teal-dark/50">
                <span className="flex items-center gap-1">
                  <CalendarDays size={12} />
                  {formatDate(event.start_date)}
                </span>
                {event.guest_count && (
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {event.guest_count} {t('eventsPage.guests')}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </DashboardLayout>
  );
}