import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarDays } from 'lucide-react';
import ClientLayout from '../components/layout/ClientLayout';
import DateDisplay from '../components/shared/DateDisplay';
import { fetchMyEvents, type ClientEventSummary } from '../lib/client';

export default function ClientPortal() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [events, setEvents] = useState<ClientEventSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyEvents().then((data) => {
      setEvents(data);
      setLoading(false);
      if (data.length === 1) {
        navigate(`/portal/events/${data[0].id}`, { replace: true });
      }
    });
  }, [navigate]);

  if (loading || events.length === 1) {
    return (
      <ClientLayout>
        <p className="text-sm text-teal-dark/50">...</p>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <h1 className="text-xl font-bold text-teal-dark mb-5">{t('portal.myEvents')}</h1>

      {events.length === 0 && <p className="text-sm text-teal-dark/50">{t('portal.noEvents')}</p>}

      <div className="space-y-3">
        {events.map((event) => {
          const displayName = i18n.language === 'am' && event.name_am ? event.name_am : event.name;
          return (
            <button
              key={event.id}
              onClick={() => navigate(`/portal/events/${event.id}`)}
              className="w-full text-left bg-white rounded-2xl border border-sage/30 p-5 hover:border-gold/40 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-teal-dark mb-1">{displayName}</h3>
              <span className="flex items-start gap-1 text-xs text-teal-dark/50">
                <CalendarDays size={12} className="mt-0.5 shrink-0" />
                <DateDisplay iso={event.start_date} />
              </span>
            </button>
          );
        })}
      </div>
    </ClientLayout>
  );
}